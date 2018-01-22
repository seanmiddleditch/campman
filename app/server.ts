import 'reflect-metadata'

import * as express from 'express'
import * as BodyParser from 'body-parser'
import * as path from 'path'
import * as exphbs   from 'express-handlebars'
import * as fs from 'fs'
import * as favicon from 'serve-favicon'
import * as passport from 'passport'
import * as session from 'express-session'
import * as redis from 'connect-redis'
import {Connection} from 'typeorm'
import {URL} from 'url'
import {Role, googleAuth} from './auth'
import {Config, config} from './config'
import {connectToDatabase} from './db'

import {routes} from './routes'
import * as models from './models'

(async () => {
    
    const root = path.join(__dirname, '..', '..')
    const staticRoot = path.join(root, 'static')
    const clientRoot = path.join(root, 'client')
    const viewsRoot = path.join(root, 'views')

    if (!config.production)
    {
        process.on('unhandledRejection', (err: Error) => {
            console.error(err, err.stack)
            process.exit(2)
        })
    }

    const connection = await connectToDatabase(config.databaseURL)

    const libraryRepository = connection.getCustomRepository(models.LibraryRepository)
    const userRepository = connection.getCustomRepository(models.UserRepository)
    const membershipRepository = connection.getCustomRepository(models.MembershipRepository)

    const app = express()
    app.engine('handlebars', exphbs({
        partialsDir: path.join(viewsRoot, 'partials'),
        layoutsDir: path.join(viewsRoot, 'partials', 'layouts')
    }))
    app.locals.config = config
    app.set('view engine', 'handlebars')
    app.set('views', path.join(viewsRoot, 'pages'))
    app.set('view cache', config.production)

    app.set('subdomain offset', (config.publicURL.hostname.match(/[.]/g) || []).length + 1)

    // static assets first, before library checks or other work
    app.use(favicon(path.join(staticRoot, 'images', 'favicon.ico')))
    app.use(express.static(staticRoot))

    app.use('/css/style.css', express.static(path.join(clientRoot, 'dist', 'style.css')))
    app.use('/js/bundle.js', express.static(path.join(clientRoot, 'dist', 'bundle.js')))
    if (!config.production)
        app.use('/js/main.js.map', express.static(path.join(clientRoot, 'dist', 'main.js.map')))

    // determine which subdomain-slug we're using, if any
    const domainCache = new Map<string, models.LibraryModel|null>()
    app.use(async (req, res, next) => {
        const library = domainCache.get(req.hostname)

        req.libraryID = 0

        if (library === undefined)
        {
            const protocol = req.secure ? 'https' : 'http'
            const slug = req.subdomains.length ? req.subdomains[req.subdomains.length - 1] : null
            const hostname = slug ? req.hostname.substr(slug.length + 1) : req.hostname
            
            if (hostname != config.publicURL.hostname || `${req.protocol}:` != config.publicURL.protocol)
            {
                return res.redirect(new URL(req.path, config.publicURL).toString())
            }
            else if (slug)
            {
                try
                {
                    req.library = await libraryRepository.findBySlug({slug})
                    if (!req.library)
                    {
                        res.status(404)
                        return res.render('not-found')
                        //return res.redirect(new URL(req.path, config.publicURL).toString())
                    }

                    domainCache.set(slug, req.library || null)
                    req.libraryID = req.library ? req.library.id : 0
                    res.locals.library = req.library
                }
                catch
                {
                    domainCache.set(slug, null)
                }
            }
        }
        else if (library !== null)
        {
            req.library = library
            req.libraryID = req.library.id
        }

        next()
    })

    // enable CORS, knowing that the prior entry ensures we're on our domain or a sub
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', req.headers.origin as string)
        res.header('Access-Control-Allow-Credentials', 'true')
        next()
    })

    app.use(BodyParser.urlencoded({extended: false}))
    app.use(BodyParser.json())
    
    passport.use(googleAuth(connection, config.publicURL.toString(), config.googleClientID, config.googleAuthSecret))
    passport.serializeUser((user: models.AccountModel, done) => done(null, user))
    passport.deserializeUser((user: any, done) => done(null, user))

    const RedisStore = redis(session)
    app.use(session({
        secret: config.sessionSecret,
        resave: false,
        unset: 'destroy',
        saveUninitialized: false,
        store: new RedisStore({url: config.redisURL}),
        cookie: {
            domain: config.publicURL.hostname,
            maxAge: 1000 * 60 * 60 * 24 // 24 hours
        }
    }))
    app.use(passport.initialize())
    app.use(passport.session())

    // set user information
    app.use(async (req, res, next) => {
        const sessionKey = `library[${req.libraryID}].role`
        const sessionRole = req.session && req.session[sessionKey]

        req.userID = req.user ? req.user.id : 0
        req.userRole = sessionRole || Role.Visitor
        res.locals.account = req.user

        if (req.userID && req.session && !sessionRole)
        {
            req.userRole = await membershipRepository.findRoleForUser(req)
            req.session[sessionKey] = req.userRole
        }

        next()
    })

    app.use(routes())

    app.use(async (req, res) => res.render('react', {
        session: JSON.stringify({
            config: {
                publicURL: config.publicURL
            },
            user: req.user || {},
            library: req.library
        })
    }))

    const server = await app.listen(config.port)
    console.log(`Listening on port ${server.address().port}`)
})().catch(err => {
    console.error(err, err.stack)
    process.exit(1)
})