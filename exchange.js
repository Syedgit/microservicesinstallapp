error

CVSEVENT=INFO {chan="Desktop",chPlat="Web",glbDigitId="",transId="17a1a102028943e38fa53df22f621e58",grid="17a1a102028943e38fa53df22f621e58",src="CVS",name="",opName="",step="getURLJSON",startTime="2025-05-14 17:03:17.103",endTime="2025-05-14 17:03:17.103",instance="MACC02GP3L81PG4",ipaddr="10.1.10.19",uid="1125425930",pid="92466",hostname="MACC02GP3L81PG4",httpMethod="POST",respTime="0",reqLength="N/A",respLength="N/A",httpStatusCde="N/A",statusCde="N/A",statusMsg="N/A",status="",sessId="",desc="The config file name to read from local server is :/Users/z243545/Documents/PSS/sdk-i90-migration/client-sdk-setprimarypharmacy/sdk-config/retailapiurlpath.json"}
CLogger.ts:265
Uncaught TypeError TypeError: util_1.isNullOrUndefined is not a function
    at <anonymous> (/Users/z243545/Documents/PSS/sdk-i90-migration/client-sdk-setprimarypharmacy/src/App.ts:181:25)
    at arrayFilter (/Users/z243545/Documents/PSS/sdk-i90-migration/client-sdk-setprimarypharmacy/node_modules/lodash/lodash.js:596:11)
    at filter (/Users/z243545/Documents/PSS/sdk-i90-migration/client-sdk-setprimarypharmacy/node_modules/lodash/lodash.js:9241:14)
    at <anonymous> (/Users/z243545/Documents/PSS/sdk-i90-migration/client-sdk-setprimarypharmacy/src/App.ts:180:30)
    at arrayEach (/Users/z243545/Documents/PSS/sdk-i90-migration/client-sdk-setprimarypharmacy/node_modules/lodash/lodash.js:530:11)
    at forEach (/Users/z243545/Documents/PSS/sdk-i90-migration/client-sdk-setprimarypharmacy/node_modules/lodash/lodash.js:9410:14)
    at routes (/Users/z243545/Documents/PSS/sdk-i90-migration/client-sdk-setprimarypharmacy/src/App.ts:178:11)
    at App (/Users/z243545/Documents/PSS/sdk-i90-migration/client-sdk-setprimarypharmacy/src/App.ts:33:14)
    at <anonymous> (/Users/z243545/Documents/PSS/sdk-i90-migration/client-sdk-setprimarypharmacy/src/App.ts:191:16)
    at <anonymous> (<node_internals>/internal/modules/cjs/loader:1572:14)
    at <anonymous> (<node_internals>/internal/modules/cjs/loader:1709:10)
    at <anonymous> (<node_internals>/internal/modules/cjs/loader:1315:32)
    at <anonymous> (<node_internals>/internal/modules/cjs/loader:1125:12)
    at traceSync (<node_internals>/diagnostics_channel:322:14)
    at wrapModuleLoad (<node_internals>/internal/modules/cjs/loader:216:24)


App.ts

import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as caremark from '@cvsdigital_caremark/caremark-node-api';
import * as retail from '@cvsdigital_caremark/retail-node-api';
import * as combinator from '@cvsdigital_specialty/combinator-node-api';
import * as specialty from '@cvsdigital_specialty/specialty-node-api';
import * as _ from 'lodash';
import * as path from 'path';
import {isNullOrUndefined} from "util";
import {validateToken} from './middleware/validateToken';
import serveIndex = require('serve-index');
import {Router, NextFunction, Request, Response} from 'express';
import {LogEntryRequest, LogExitRequest} from './middleware/logging';
// tslint:disable-next-line:no-var-requires
const redisrouter = require('@cvsdigital_specialty/redis-node-api');
// tslint:disable-next-line:no-var-requires
const cors = require('cors');


// Creates and configures an ExpressJS web server.
class App {

    // ref to Express instance
    public express: express.Application;

    private allowedHttpsVerbs: string[] = ["OPTIONS", "POST", "GET", "HEAD"];

    // Run configuration methods on the Express instance.
    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
        // this.gatherPackageVersions();
    }

    // Configure Express middleware.
    private middleware(): void {
        if ((process.env.CORS) === 'true') {
            // Aravind: Do not remove as we have cross domain issue in caremark side to access api.
            // There is no impact as this is enabled only for local.
            this.express.use(cors({
                origin: "*"
            }));
        }
        this.express.set("view engine", "pug");
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({extended: false}));
        this.express.use(this.allowKnownHttpVerbs());

    }

    /**
     * @ Allow the known http verbs and reject any other request type
     * Plug security hole in the SDK server to stop any other methods.
     *
     * @private
     * @returns
     * @memberof App
     */
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

    // private gatherPackageVersions(): void {
    //     // const dirs = fs.readdirSync('node_modules');
    //     const dirs = ['@cvsdigital_specialty/'];
    //     const data = {};
    //     dirs.forEach(function (dir) {
    //         try {
    //             const file = 'node_modules/' + dir + '/package.json';
    //             const json = require(file);
    //             const name = json.name;
    //             const version = json.version;
    //             data[name] = version;
    //         } catch (err) {
    //             console.log(err);
    //         }
    //     });
    //     debugger;
    // }

    // Configure API endpoints.
    private routes(): void {
            LogExitRequest());
        
        this.express.use('/client-sdk/AGP/api/client',
            LogEntryRequest(),
            validateToken(),
            LogExitRequest(),
            new combinator.CombinatorRouter().getCombinatorRouter,
            LogExitRequest());


        // tired of folks not being able to access log files. make a provision of same.
        // disable the same for prod.

        // @ts-ignore
        if (true || (process.env.ENV && process.env.ENV.toLowerCase().indexOf('prod') === -1)) {
            this.express.use('/log', express.static(path.resolve(process.env.NODE_PATH || "", './../../log')));
            this.express.use('/log', serveIndex(path.resolve(process.env.NODE_PATH || "", './../../log')));
            this.express.use('/config', express.static(path.resolve(process.env.NODE_PATH || "", './../../config')));
            this.express.use('/config', serveIndex(path.resolve(process.env.NODE_PATH || "", './../../config')));
        }
        // included the redis router for Vordel to call
        // commenting out the redis, because someone is settingthe key8900 wth value "0000";

        this.express.use('/api/client', redisrouter.redisRouter);

        const hcrouter: Router = Router();
        hcrouter.use(function(_req: Request, res: Response, next: NextFunction) {
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
                return !isNullOrUndefined(item1.route);
            });
            _.each(routes, (item1) => {
                routeMetadata[item.regexp.source].push(item1.route);
            });
        });
    }

}

export default new App().express;
export {combinator, specialty};
