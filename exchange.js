appRoutes.js


'use strict'

const express = require('express')

const router = new express.Router()
const appAccountController = require('../controllers/appAccountController')
const applicationsController = require('../controllers/applicationsController')
const {
    loginLimiter,
    addAppLimiter,
    accountRegisterLimiter
} = require('../rateLimiters')

router.post('/accountRegister',
    accountRegisterLimiter,
    appAccountController.registerAppAccount)

router.post('/accountlogin',
    loginLimiter,
    appAccountController.loginAppAccount)

router.get('/accountlogout', appAccountController.appAccountLogout)

router.get('/accountregister/verifyemail/:verfyToken',
    accountRegisterLimiter,
    appAccountController.verifyEmail)

router.post('/addapplication',
    addAppLimiter,
    appAccountController.requireLogin,
    applicationsController.addDomainName)

router.post('/appVerify',
    addAppLimiter,
    appAccountController.checkAppAccountCreds,
    applicationsController.verifyDomain)

router.get('/usersList/:domainName',
    appAccountController.requireLogin,
    applicationsController.getUsersList)

module.exports = router

Socket.js

Code block 1 selected
'use strict'

const { logger } = require('../logger/logger-init')
const { redisClientSystemSets } = require('../redisDb/redisDb')
const { socketMessagesLimiter } = require('../rateLimiters')

let io
function requireLogin(socket, next) {
    if ((!socket.request.session)
        || (!socket.request.session.email)
        || (!socket.request.session.logged)
        || (!socket.request.session.domainOrigin)
        ) {
        return next(new Error('not authorized'))
    }
    if (!socket.request.session.emailVerified) {
        return next(new Error('not authorized.email not verified'))
    }
    return next()
}

module.exports.init = (ioExample, callback) => {
    io = ioExample

    io.origins(async (origin, originsCallback) => {
        const originDomain = origin.replace('https://', '')
        let isOriginAlowed
        try {
            isOriginAlowed = await redisClientSystemSets.sismemberAsync(
                'allowedDomains',
                originDomain
            )
        } catch (error) {
            logger.error(error)
            return originsCallback('origin not allowed', false)
        }
        if (isOriginAlowed) {
            return originsCallback(null, true)
        }
        logger.error({
            type: 'socket connection denyed',
            origin
        })
        return originsCallback('origin not allowed', false)
    })

    io.use(requireLogin)
    io.sockets.on('error', (error) => {
        logger.error(error)
    })

    io.on('connection', (socket) => {
        if (socket.request.session && socket.request.session.domainOrigin) {
            socket.join(socket.request.session.domainOrigin)
            socket.to(socket.request.session.domainOrigin).emit(
                'userentered',
                socket.request.session.nickName
            )
        } else {
            socket.request.session.domainOrigin = '/'
        }

        socket.on('disconnect', (reason) => {
            logger.info(`socket ${socket.id} disconnect reason`, reason)
            if (socket.request.session && socket.request.session.domainOrigin) {
                socket.to(socket.request.session.domainOrigin).emit(
                    'userleaved',
                    socket.request.session.nickName
                )
            }
        })

        socket.on('message', async (data, messCallback) => {
            try {
                await socketMessagesLimiter.consume(socket.handshake.address)
                socket.to(socket.request.session.domainOrigin ).emit(
                    'message',
                    data
                )
            } catch (rejRes) {
                socket.emit('blocked', { 'retry-ms': rejRes.msBeforeNext })
            }
            return messCallback(true)
        })

        socket.on('error', (error) => {
            logger.error(error)
            if (
                error.message === 'not authorized'
                || error.message === 'not authorized.email not verified'
            ) {
                socket.disconnect()
            }
        })
    })
    logger.info('socket initialised')
    callback(null, io)
}

module.exports.getIo = () => {
    return io
}
