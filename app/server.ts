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
import * as postgressConnectionStringParser from 'pg-connection-string'
import {createConnection, Connection} from 'typeorm'
import {URL} from 'url'
import {Role, googleAuth} from './auth'
import {Config} from './config'

import * as routes from './routes'
import * as models from './models'

(async () => {
    
    const root = path.join(__dirname, '..', '..')
    const staticRoot = path.join(root, 'static')
    const clientRoot = path.join(root, 'client')
    const viewsRoot = path.join(root, 'views')

    const config = new Config()

    if (!config.production)
    {
        process.on('unhandledRejection', (err: Error) => {
            console.error(err, err.stack)
            process.exit(2)
        })
    }

    
    const connectionOptions = postgressConnectionStringParser.parse(process.env.DATABASE_URL || '')
    const connection = await createConnection({
        type: 'postgres',
        host: connectionOptions.host || 'localhost',
        port: connectionOptions.port || 5432,
        username: connectionOptions.user || '',
        password: connectionOptions.password || '',
        database: connectionOptions.database || '',
        migrations: [path.join(__dirname, 'migrations', '*.js')],
        ssl: true,
        entities: [
            models.Library,
            models.Membership,
            models.Label,
            models.Note,
            models.User,
            models.MediaFile,
            models.Map,
            models.Invitation
        ]
    })

    console.log('Running pending migrations')
    await connection.runMigrations()

    const libraryRepository = connection.getCustomRepository(models.LibraryRepository)
    const userRepository = connection.getCustomRepository(models.UserRepository)
    const membershipRepository = connection.getCustomRepository(models.MembershipRepository)

    const app = express()
    app.engine('handlebars', exphbs({
        defaultLayout: 'main',
        partialsDir: path.join(viewsRoot, 'partials'),
        layoutsDir: path.join(viewsRoot, 'layouts')
    }))
    app.set('view engine', 'handlebars')
    app.set('views', viewsRoot)

    app.set('subdomain offset', (config.publicURL.hostname.match(/[.]/g) || []).length + 1)

    // static assets first, before library checks or other work
    app.use(favicon(path.join(staticRoot, 'images', 'favicon.ico')))
    app.use(express.static(staticRoot))

    app.use('/dist', express.static(path.join(clientRoot, 'dist')))

    // determine which subdomain-slug we're using, if any
    const domainCache = new Map<string, models.Library|null>()
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
                    domainCache.set(slug, req.library || null)
                    req.libraryID = req.library ? req.library.id : 0
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
    passport.serializeUser((user: models.User, done) => done(null, user))
    passport.deserializeUser((user: any, done) => done(null, user))

    const RedisStore = redis(session)
    app.use(session({
        secret: config.sessionSecret,
        resave: false,
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

        if (req.userID && req.session && !sessionRole)
        {
            req.userRole = await membershipRepository.findRoleForUser(req)
            req.session[sessionKey] = req.userRole
        }

        next()
    })

    app.use(routes.authRoutes(connection, config))
    app.use(routes.api(connection, config))

    app.use(async (req, res) => res.render('index', {
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