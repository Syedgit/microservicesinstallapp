json.parser-middleware.js
'use strict';

import { HTTP_STATUS, logger, ApiError } from '../common/index.js';

const allowMethods = Object.freeze(['POST', 'PUT', 'PATCH']);

const LOG_MESSAGE = Object.freeze({
    PAYLODAD_TOO_LARGE: 'payload too large',
});

function jsonParserMiddleware(req, res, next) {
    if (!allowMethods.includes(req.method)) {
        return next();
    }

    if (!(req.headers['content-type']).toLowerCase()
        .includes('application/json')) {
        return next();
    }

    let data = '';

    req.on('data', (chunk) => {
        data += chunk;
        if (data.length > 1e6) {
            logger.info(LOG_MESSAGE.PAYLODAD_TOO_LARGE);
            req.destroy()
        }
    });

    req.on('end', () => {
        if (res.writableEnded) {
            return;
        }
        try {
            req.body = JSON.parse(data);
            return next();
        } catch (e) {
            logger.error({ message: e?.message, stack: e?.stack })
            res.writeHead(
                e?.httpCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR,
                 { 'Content-Type': 'application/json' },
            );
            res.end(JSON.stringify({ 
                success: false, 
                message: (e instanceof ApiError) ? e?.message : '', 
            }));
        }
    });
}

export { jsonParserMiddleware };

rate-linit


'use strict';

import redis from 'redis';
import { config, HTTP_STATUS, logger } from '../common/index.js';
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { authGuard } from '../components/index.js';

const redisClient = redis.createClient({
    host: config.REDIS.REDIS_HOST,
    port: config.REDIS.REDIS_PORT,
    enable_offline_queue: false,
});

redisClient.on('error', (e) => {
    logger.error({ e });
});

const rateLimiterMemory = new RateLimiterMemory({
    points: config.RATE_LIMIT.MEMORY_RATE_LIMIT_POINTS || 60,
    duration: config.RATE_LIMIT.MEMORY_RATE_LIMIT_DURATION || 60,
  });


const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rate_limit_middleware',
    points: config.RATE_LIMIT.REDIS_RATE_LIMIT_POINTS || 300,
    duration: config.RATE_LIMIT.REDIS_RATE_LIMIT_DURATION || 60, 
    inmemoryBlockOnConsumed: 301,
    inmemoryBlockDuration: 60,
    insuranceLimiter: rateLimiterMemory,
});

async function rateLimitMiddleware(req, res, next) {
    try {
        const userId = await authGuard.extractUserId(req.token);

        if (userId ?? req.token) {
            await rateLimiter.consume(
                userId,
            );
        }

        return next();
    } catch (e) {
        logger.error({ rateLimiterCatch: e }, HTTP_STATUS.TOO_MANY_REQUESTS);
        res.writeHead(
            e?.httpCode ?? HTTP_STATUS.TOO_MANY_REQUESTS, 
            { 'Content-Type': 'application/json' },
        );
        res.end(JSON.stringify({ success: false }));
    }
};

export { rateLimitMiddleware };
