import 'reflect-metadata';

import * as express from 'express';
import * as session from 'express-session';
import * as BodyParser from 'body-parser';
import * as squell from 'squell';
import * as path from 'path';
import * as passport from 'passport';

import {AuthRouter, LabelRouter, NoteRouter} from './routes';
import {LibraryModel, LabelModel, NoteModel, UserModel} from './models';
import GoogleAuth from './auth/GoogleAuth';

(async () => {
    
    const root = path.join(__dirname, '..', '..');
    const staticRoot = path.join(root, 'static');
    
    const config = require(path.join(root, 'config.json'));
    
    const dbFileName = 'test.db';
    const dbPath = path.join(root, dbFileName);
    console.log(dbPath);
    const db = new squell.Database('sqlite://' + dbFileName, {dialect: 'sqlite', database: dbPath, define: {timestamps: false}});
    
    db.define(LibraryModel);
    db.define(LabelModel);
    db.define(NoteModel);
    db.define(UserModel);

    await db.sync();

    passport.use(GoogleAuth(db, config.siteURL, config.auth.google));
    passport.serializeUser((user: UserModel, done) => done(null, user.id));
    passport.deserializeUser((userID: number, done) => db.query(UserModel).where(m => m.id.eq(userID)).findOne().then(user => done(null, user)).catch(err => done(err)));

    const app = express();
    app.use(BodyParser.urlencoded({extended: false}));
    app.use(BodyParser.json());
    app.use(session({secret: config.auth.sessionSecret}));
    app.use(passport.initialize());
    app.use(passport.session());

    if (process.env.NODE_ENV !== 'production')
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
                clientId: config.auth.google.clientId
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

    // production users should be using a reverse proxy
    if (process.env.NODE_ENV !== 'production')
    {
        app.use(express.static(staticRoot));
        app.get('*', (req, res) => res.sendFile(path.join(staticRoot, 'index.html')));
    }

    const server = await app.listen(process.env.PORT || 8080);
    console.log(`Listening on port ${server.address().port}`);
})();