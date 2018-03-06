import 'reflect-metadata'

import * as express from 'express'
import * as BodyParser from 'body-parser'
import * as path from 'path'
import * as exphbs from 'express-handlebars'
import * as fs from 'fs'
import * as favicon from 'serve-favicon'
import * as passport from 'passport'
import * as session from 'express-session'
import * as redis from 'connect-redis'
import * as cors from 'cors'
import * as os from 'os'
import { CorsOptions } from 'cors'
import { Connection } from 'typeorm'
import { URL } from 'url'
import { CampaignRole, googleAuth } from './auth'
import { Config, config } from './config'
import { connectToDatabase } from './db'
import * as handlebarsHelpers from './util/handlebars-helpers'

import * as routes from './routes'

(async () => {

    const root = path.join(__dirname, '..', '..')

    if (!config.production) {
        process.on('unhandledRejection', (err: Error) => {
            console.error(err, err.stack)
            process.exit(2)
        })
    }

    const connection = await connectToDatabase(config.databaseURL)

    const app = express()
    app.engine('handlebars', exphbs({
        partialsDir: path.join(root, 'views', 'partials'),
        layoutsDir: path.join(root, 'views', 'partials', 'layouts'),
        helpers: handlebarsHelpers
    }))
    app.locals.config = {
        publicURL: config.publicURL,
        googleAnalyticsId: config.googleAnalyticsId
    }
    app.set('view engine', 'handlebars')
    app.set('views', path.join(root, 'views', 'pages'))
    app.set('view cache', config.production)

    app.set('subdomain offset', (config.publicURL.hostname.match(/[.]/g) || []).length + 1)

    const host = config.publicURL.hostname
    const apiHost = `api.${host}`
    const wwwHost = `www.${host}`
    const mediaHost = `media.${host}`

    app.locals.apiHost = new URL('', config.publicURL)
    app.locals.apiHost.hostname = `api.${app.locals.apiHost.hostname}`

    // static assets first, before campaign checks or other work
    app.use(favicon(path.join(root, 'static', 'images', 'favicon.ico')))
    app.use(express.static(path.join(root, 'static')))

    if (config.production)
    {
        app.use('/js/bundle.js', express.static(path.join(root, 'dist', 'bundle.js')))
    }
    else
    {
        const webpack = require('webpack')
        const webpackDevMiddleware = require('webpack-dev-middleware')
        const webpackConfig = require(path.join(root, 'webpack.dev.config.js'))
        const compiler = webpack(webpackConfig)
        app.use(webpackDevMiddleware(compiler, {
            publicPath: webpackConfig.output.publicPath
        }))
    }

    const corsOptions: CorsOptions = {
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true) // browser not using CORS or has no origin

            const hostname = new URL(origin).hostname
            if (hostname === host || hostname.endsWith(`.${host}`))
                callback(null, true) // browser origin matches our subs
            else
                callback(new Error('Not allowed by CORS'), false) // unknown origin
        },
        credentials: true
    }
    app.use(cors(corsOptions))

    app.use(BodyParser.urlencoded({ extended: false, limit: 5*1024*1024 }))
    app.use(BodyParser.json({type: 'application/json'}))

    passport.use(googleAuth(connection, config.publicURL.toString(), config.googleClientID, config.googleAuthSecret))
    passport.serializeUser((user: any, done) => done(null, user))
    passport.deserializeUser((user: any, done) => done(null, user))

    const RedisStore = redis(session)
    app.use(session({
        secret: config.sessionSecret,
        resave: false,
        unset: 'destroy',
        saveUninitialized: false,
        store: new RedisStore({ url: config.redisURL }),
        cookie: {
            domain: config.publicURL.hostname,
            maxAge: 1000 * 60 * 60 * 24 // 24 hours
        }
    }))
    app.use(passport.initialize())
    app.use(passport.session())

    // set profile information
    app.use(async (req, res, next) => {
        req.profileId = req.user ? req.user.id : 0
        res.locals.profile = req.user
        next()
    })

    const apiRouter = routes.apiRoutes()
    const mainRouter = routes.mainRoutes()
    const campaignRouter = routes.campaignRoutes()
    const mediaRouter = routes.mediaRoutes()

    app.use(async (req, res, next) => {
        if (req.hostname === host)
            mainRouter(req, res, next)
        else if (req.hostname === mediaHost)
            mediaRouter(req, res, next)
        else if (req.hostname === apiHost)
            apiRouter(req, res, next)
        else if (req.hostname === wwwHost)
            res.redirect(config.publicURL.toString())
        else if (req.hostname.endsWith(`.${host}`))
            campaignRouter(req, res, next)
        else
            res.redirect(config.publicURL.toString(), 307)
    })

    const server = await app.listen(config.port)
    console.log(`Listening on port ${server.address().port}`)
})().catch(err => {
    console.error(err, err.stack)
    process.exit(1)
})
