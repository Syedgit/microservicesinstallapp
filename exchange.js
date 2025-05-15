import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as caremark from '@cvsdigital_caremark/caremark-node-api';
import * as retail from '@cvsdigital_caremark/retail-node-api';
import * as combinator from '@cvsdigital_specialty/combinator-node-api';
import * as specialty from '@cvsdigital_specialty/specialty-node-api';
import * as _ from 'lodash';
import * as path from 'path';
import { validateToken } from './middleware/validateToken';
import serveIndex = require('serve-index');
import { Router, NextFunction, Request, Response } from 'express';
import { LogEntryRequest, LogExitRequest } from './middleware/logging';
const redisrouter = require('@cvsdigital_specialty/redis-node-api');
const cors = require('cors');

class App {
    public express: express.Application;
    private allowedHttpsVerbs: string[] = ["OPTIONS", "POST", "GET", "HEAD"];

    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
    }

    private middleware(): void {
        if ((process.env.CORS) === 'true') {
            this.express.use(cors({ origin: "*" }));
        }
        this.express.set("view engine", "pug");
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(this.allowKnownHttpVerbs());
    }

    private allowKnownHttpVerbs() {
        const __this = this;
        return (req: Request, res: Response, next: NextFunction) => {
            if (__this.allowedHttpsVerbs.indexOf(req.method) === -1) {
                const ErrorDetails = {
                    header: {
                        statusCode: 9999,
                        statusDesc: "Method Not Allowed!!",
                    }
                };
                res.status(405);
                res.send(JSON.stringify(ErrorDetails));
            } else {
                next();
            }
        };
    }

    private routes(): void {
        LogExitRequest();

        this.express.use('/client-sdk/AGP/api/client',
            LogEntryRequest(),
            validateToken(),
            LogExitRequest(),
            new combinator.CombinatorRouter().getCombinatorRouter,
            LogExitRequest()
        );

        if (true || (process.env.ENV && process.env.ENV.toLowerCase().indexOf('prod') === -1)) {
            this.express.use('/log', express.static(path.resolve(process.env.NODE_PATH || "", './../../log')));
            this.express.use('/log', serveIndex(path.resolve(process.env.NODE_PATH || "", './../../log')));
            this.express.use('/config', express.static(path.resolve(process.env.NODE_PATH || "", './../../config')));
            this.express.use('/config', serveIndex(path.resolve(process.env.NODE_PATH || "", './../../config')));
        }

        this.express.use('/api/client', redisrouter.redisRouter);

        const hcrouter: Router = Router();
        hcrouter.use(function (_req: Request, res: Response, next: NextFunction) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            next();
        });

        hcrouter.get('/healthcheck', (_req: Request, _res: Response) => {
            _res.status(200).send('OK');
        });

        this.express.use('/', hcrouter);

        const routers = _.filter(this.express._router.stack, (item) => {
            return item.name === 'router';
        });

        const routeMetadata: any = {};
        _.each(routers, (item) => {
            routeMetadata[item.regexp.source] = [];
            const routes = _.filter(item.handle.stack, (item1) => {
                return !_.isNil(item1.route);  // ✅ replaced isNullOrUndefined with _.isNil
            });
            _.each(routes, (item1) => {
                routeMetadata[item.regexp.source].push(item1.route);
            });
        });
    }
}

export default new App().express;
export { combinator, specialty };
