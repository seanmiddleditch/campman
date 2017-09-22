import 'reflect-metadata';

import * as express from 'express';
import * as BodyParser from 'body-parser';
import {Database} from 'squell';
import * as path from 'path';
import * as exphbs   from 'express-handlebars';
import * as fs from 'fs';
import * as favicon from 'serve-favicon';
import * as passport from 'passport';
import * as session from 'express-session';
import * as redis from 'connect-redis';
import {URL} from 'url';

import * as routes from './routes';
import * as models from './models';
import {GoogleAuth, User} from './auth';

class Config
{
    readonly publicURL: URL;
    readonly googleClientID: string;
    readonly googleAuthSecret: string;
    readonly sessionSecret: string;
    readonly port: number;
    readonly redisURL: string;
    readonly databaseURL: string;
    readonly production: boolean;
    readonly webpackDev: boolean;
    readonly awsRegion: string;
    readonly awsAccessKey: string;
    readonly awsAuthSecret: string;
    readonly s3Bucket: string;

    constructor()
    {
        this.publicURL = new URL(process.env.PUBLIC_URL || 'http://localhost:8080');
        this.port = parseInt(process.env.PORT || '8080', 10);
        this.googleClientID = process.env.GOOGLE_CLIENT_ID || '';
        this.googleAuthSecret = process.env.GOOGLE_AUTH_SECRET || '';
        this.sessionSecret = process.env.CM_SESSION_SECRET || '';
        this.webpackDev = process.env.CM_WEBPACK_DEV === 'true';
        this.redisURL = process.env.REDIS_URL || '';
        this.databaseURL = process.env.DATABASE_URL || '';
        this.awsRegion = process.env.AWS_REGION || '';
        this.awsAccessKey = process.env.AWS_ACCESS_KEY || '';
        this.awsAuthSecret = process.env.AWS_SECRET || '';
        this.s3Bucket = process.env.S3_BUCKET || '';
        this.production = process.env.NODE_ENV === 'production';
    }
};

(async () => {
    
    const root = path.join(__dirname, '..', '..');
    const staticRoot = path.join(root, 'static');
    const clientRoot = path.join(root, 'client');
    const viewsRoot = path.join(root, 'views');

    const config = new Config();

    if (!config.production)
    {
        process.on('unhandledRejection', (err: Error) => {
            console.error(err, err.stack);
            process.exit(2);
        });
    }

    const db = new Database(config.databaseURL, {dialect: 'postgres', dialectOptions: {ssl: true}, define: {timestamps: false}});
    
    db.define(models.LibraryModel);
    db.define(models.LibraryAccessModel);
    db.define(models.LabelModel);
    db.define(models.NoteModel);
    db.define(models.UserModel);

    await db.sync();

    const app = express();
    app.engine('handlebars', exphbs({
        defaultLayout: 'main',
        partialsDir: path.join(viewsRoot, 'partials'),
        layoutsDir: path.join(viewsRoot, 'layouts')
    }));
    app.set('view engine', 'handlebars');
    app.set('views', viewsRoot);

    app.set('subdomain offset', (config.publicURL.hostname.match(/[.]/g) || []).length + 1);

    // load the library if we're on a sub-domain
    app.use(async (req, res, next) => {
        const protocol = req.secure ? 'https' : 'http';
        const sub = req.subdomains.length ? req.subdomains[req.subdomains.length - 1] : null;
        const hostname = sub ? req.hostname.substr(sub.length + 1) : req.hostname;
      
        if (hostname != config.publicURL.hostname || `${req.protocol}:` != config.publicURL.protocol)
        {
            res.redirect(new URL(req.path, config.publicURL).toString());
        }
        else
        {
            if (sub)
            {
                req.library = await db.query(models.LibraryModel).where(m => m.slug.eq(sub)).findOne();
                if (!req.library)
                    return res.redirect(config.publicURL.toString());
            }
                
            next();
        }
    });

    app.use(favicon(path.join(staticRoot, 'images', 'favicon.ico')));
    app.use(BodyParser.urlencoded({extended: false}));
    app.use(BodyParser.json());
    
    passport.use(GoogleAuth(db, config.publicURL.toString(), config.googleClientID, config.googleAuthSecret));
    passport.serializeUser((user: models.UserModel, done) => done(null, user));
    passport.deserializeUser((user: User, done) => done(null, user));

    const RedisStore = redis(session);
    app.use(session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: new RedisStore({url: config.redisURL}),
        cookie: {
            domain: config.publicURL.hostname,
            maxAge: 1000 * 60 * 24 // 24 hours
        }
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    if (!config.production)
    {
        console.log('Enabling WebPack development middlware');

        const webpackConfig = require(path.join(clientRoot, 'webpack.config.js'));
        const webpackDevMiddleware = require('webpack-dev-middleware');
        const webpack = require('webpack');
        app.use(webpackDevMiddleware(webpack(webpackConfig), {
            publicPath: webpackConfig.output.publicPath
        }));
    }

    app.get('/config.js', (req, res) => {
        res.json({
            publicURL: config.publicURL
        });
    });

    app.use(routes.AuthRoutes(db, config));
    app.use(routes.NoteRouter(db));
    app.use(routes.LabelRouter(db));
    app.use(routes.LibraryRouter(db));
    app.use(routes.MediaRoutes(db, config));

    if (config.production)
    {
        console.log('Serving /js');
        app.use('/js', express.static(path.join(clientRoot, 'dist')));
    }

    app.use(express.static(staticRoot));
    app.use(async (req, res) => res.render('index', {
        session: JSON.stringify({
            config: {
                publicURL: config.publicURL
            },
            user: req.user || {},
            library: req.library
        })
    }));

    const server = await app.listen(config.port);
    console.log(`Listening on port ${server.address().port}`);
})().catch(err => {
    console.error(err, err.stack);
    process.exit(1);
});