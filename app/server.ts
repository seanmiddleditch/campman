import 'reflect-metadata';

import * as express from 'express';
import * as session from 'express-session';
import * as BodyParser from 'body-parser';
import * as squell from 'squell';
import * as path from 'path';
import * as passport from 'passport';
import * as redis from 'connect-redis';
import * as fs from 'fs';

import {AuthRouter, LabelRouter, NoteRouter} from './routes';
import {LibraryModel, LabelModel, NoteModel, UserModel} from './models';
import GoogleAuth from './auth/GoogleAuth';

class Config
{
    readonly publicURL: string;
    readonly googleClientID: string;
    readonly googleAuthSecret: string;
    readonly sessionSecret: string;
    readonly port: number;
    readonly redisURL: string;
    readonly databaseURL: string;
    readonly production: boolean;

    constructor()
    {
        this.publicURL = process.env.PUBLIC_URL || 'http://localhost';
        this.port = parseInt(process.env.PORT, 10);
        if (this.port != 80)
            this.publicURL += `:${this.port}`;
        
        this.googleClientID = process.env.GOOGLE_CLIENT_ID;
        this.googleAuthSecret = process.env.GOOGLE_AUTH_SECRET;
        this.sessionSecret = process.env.CM_SESSION_SECRET;
        this.redisURL = process.env.REDIS_URL;
        this.databaseURL = process.env.DATABASE_URL;
        this.production = process.env.NODE_ENV === 'production';
    }
};

(async () => {
    
    const root = path.join(__dirname, '..', '..');
    const staticRoot = path.join(root, 'static');

    const config = new Config();
    
    const db = new squell.Database(config.databaseURL, {dialect: 'postgres', define: {timestamps: false}});
    
    db.define(LibraryModel);
    db.define(LabelModel);
    db.define(NoteModel);
    db.define(UserModel);

    await db.sync();

    const RedisStore = redis(session);

    if (config.googleClientID)
    {
        passport.use(GoogleAuth(db, config.publicURL, config.googleClientID, config.googleAuthSecret));
        passport.serializeUser((user: UserModel, done) => done(null, user.id));
        passport.deserializeUser((userID: number, done) => db.query(UserModel).where(m => m.id.eq(userID)).findOne().then(user => done(null, user)).catch(err => done(err)));
    }

    const app = express();
    app.use(BodyParser.urlencoded({extended: false}));
    app.use(BodyParser.json());
    app.use(session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: config.redisURL ? new RedisStore({url: config.redisURL}) : null
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    if (config.production)
    {
        console.log('Enabling WebPack development middlware');

        const webpackConfig = require(path.join(root, 'client', 'webpack.config.js'));
        const webpackDevMiddleware = require('webpack-dev-middleware');
        const webpack = require('webpack');
        app.use(webpackDevMiddleware(webpack(webpackConfig), {
            publicPath: webpackConfig.output.publicPath
        }));
    }

    app.get('/config.js', (req, res) => {
        res.json({
            google: {
                clientId: config.googleClientID
            },
            session: {
                key: req.sessionID,
                user: req.user ? {id: req.user.id} : null
            }
        });
    });

    app.use(AuthRouter());
    app.use(NoteRouter(db));
    app.use(LabelRouter(db));

    app.use(express.static(staticRoot));
    app.get('*', (req, res) => res.sendFile(path.join(staticRoot, 'index.html')));

    const server = await app.listen(config.port);
    console.log(`Listening on port ${server.address().port}`);
})();