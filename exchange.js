Soltuion # 1


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
        const pointsToConsume = userId ? 5 : 1;
        const limiterKey = userId ?? (req.ip ?? req?.socket.remoteAddress)
        
        const limiterRes = await rateLimiter.consume(
           limiterKey,
           pointsToConsume,
        );

        logger.info(limiterRes, limiterKey);

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


solution # 2 

Selected solution 
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
        const pointsToConsume = userId ? 1 : 5;
        const limiterKey = req.ip ?? req?.socket.remoteAddress;
        
        const limiterRes = await rateLimiter.consume(
           limiterKey,
           pointsToConsume,
        );

        logger.info(limiterRes, limiterKey);

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

Solution # 3 


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
        const pointsToConsume = userId ? 1 : 5;
        const limiterKey = userId ?? (req.ip ?? req?.socket.remoteAddress)
        
        const limiterRes = await rateLimiter.consume(
           limiterKey,
           pointsToConsume,
        );

        logger.info(limiterRes, limiterKey);

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

solution # 4


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
        const pointsToConsume = userId ? 1 : 5;
        const limiterKey = userId ?? (req.ip ?? req?.socket.remoteAddress)
        
        const limiterRes = await rateLimiter.consume(
           limiterKey,
           pointsToConsume,
        );

        logger.info(limiterRes, limiterKey);

        return next();
    } catch (e) {
        logger.error({ rateLimiterCatch: e }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        res.writeHead(
            e?.httpCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR, 
            { 'Content-Type': 'application/json' },
        );
        res.end(JSON.stringify({ success: false }));
    }
};

export { rateLimitMiddleware };
