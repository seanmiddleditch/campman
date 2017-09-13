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
    
    const db = new squell.Database(process.env.DATABASE_URL, {dialect: 'postgres', define: {timestamps: false}});
    
    db.define(LibraryModel);
    db.define(LabelModel);
    db.define(NoteModel);
    db.define(UserModel);

    await db.sync();

    const publicPort = process.env.PORT || 8080;
    const publicURL = process.env.PUBLIC_URL || ('http://localhost:' + publicPort);

    passport.use(GoogleAuth(db, publicURL, process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_AUTH_SECRET));
    passport.serializeUser((user: UserModel, done) => done(null, user.id));
    passport.deserializeUser((userID: number, done) => db.query(UserModel).where(m => m.id.eq(userID)).findOne().then(user => done(null, user)).catch(err => done(err)));

    const app = express();
    app.use(BodyParser.urlencoded({extended: false}));
    app.use(BodyParser.json());
    app.use(session({secret: process.env.CM_SESSION_SECRET}));
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
                clientId: process.env.GOOGLE_CLIENT_ID
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

    const server = await app.listen(publicPort);
    console.log(`Listening on port ${server.address().port}`);
})();