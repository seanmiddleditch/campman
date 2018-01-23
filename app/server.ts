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
import {CampaignRole, googleAuth} from './auth'
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

    const campaignRepository = connection.getCustomRepository(models.CampaignRepository)
    const userRepository = connection.getCustomRepository(models.ProfileRepository)
    const membershipRepository = connection.getCustomRepository(models.MembershipRepository)

    const app = express()
    app.engine('handlebars', exphbs({
        partialsDir: path.join(viewsRoot, 'partials'),
        layoutsDir: path.join(viewsRoot, 'partials', 'layouts')
    }))
    app.locals.config = {
        publicURL: config.publicURL
    }
    app.set('view engine', 'handlebars')
    app.set('views', path.join(viewsRoot, 'pages'))
    app.set('view cache', config.production)

    app.set('subdomain offset', (config.publicURL.hostname.match(/[.]/g) || []).length + 1)

    // static assets first, before campaign checks or other work
    app.use(favicon(path.join(staticRoot, 'images', 'favicon.ico')))
    app.use(express.static(staticRoot))

    app.use('/css/style.css', express.static(path.join(clientRoot, 'dist', 'style.css')))
    app.use('/js/bundle.js', express.static(path.join(clientRoot, 'dist', 'bundle.js')))
    if (!config.production)
        app.use('/js/main.js.map', express.static(path.join(clientRoot, 'dist', 'main.js.map')))

    // determine which subdomain-slug we're using, if any
    const domainCache = new Map<string, models.CampaignModel|null>()
    app.use(async (req, res, next) => {
        const campaign = domainCache.get(req.hostname)

        if (campaign === undefined)
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
                    req.campaign = await campaignRepository.findBySlug({slug})
                    if (!req.campaign)
                    {
                        res.status(404)
                        return res.render('not-found')
                        //return res.redirect(new URL(req.path, config.publicURL).toString())
                    }

                    domainCache.set(req.hostname, req.campaign || null)
                    req.campaign.id = req.campaign ? req.campaign.id : 0
                    res.locals.campaign = req.campaign
                }
                catch
                {
                    domainCache.set(req.hostname, null)
                }
            }
        }
        else if (campaign !== null)
        {
            req.campaign = campaign
            res.locals.campaign = campaign
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
    passport.serializeUser((user: models.ProfileModel, done) => done(null, user))
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

    // set profile information
    app.use(async (req, res, next) => {
        const sessionKey = req.campaign ? `campaign[${req.campaign.id}].role` : 'Visitor'
        const sessionRole = req.session && req.session[sessionKey]

        req.profileId = req.user ? req.user.id : 0
        req.campaignRole = sessionRole || CampaignRole.Visitor
        res.locals.profile = req.user

        if (req.profileId && req.session && !sessionRole && req.campaign)
        {
            req.campaignRole = await membershipRepository.findRoleForProfile({profileId: req.profileId, campaignId: req.campaign.id})
            req.session[sessionKey] = req.campaignRole
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
            campaign: req.campaign
        })
    }))

    const server = await app.listen(config.port)
    console.log(`Listening on port ${server.address().port}`)
})().catch(err => {
    console.error(err, err.stack)
    process.exit(1)
})