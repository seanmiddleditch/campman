import 'reflect-metadata';

import * as express from 'express';
import * as session from 'express-session';
import * as BodyParser from 'body-parser';
import * as squell from 'squell';
import * as path from 'path';
import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import * as passport from 'passport';

import {AuthRouter, LabelRouter, NoteRouter} from './routes';
import {LibraryModel, LabelModel, NoteModel, UserModel} from './models';
import GoogleAuth from './auth/GoogleAuth';

(async () => {
    
    const root = path.join(__dirname, '..', '..');
    const viewsRoot = path.join(root, 'app', 'views');
    const staticRoot = path.join(root, 'static');
    
    const config = require(path.join(root, 'config.json'));
    
    const dbPath = 'test.db';
    const db = new squell.Database('sqlite://' + dbPath, {dialect: 'sqlite', database: dbPath, define: {timestamps: false}});
    
    db.define(LibraryModel);
    db.define(LabelModel);
    db.define(NoteModel);
    db.define(UserModel);

    await db.sync();
    

    const webpackConfig = require(path.join(root, 'webpack.config.js'));

    passport.use(GoogleAuth(db, config.siteURL, config.auth.google));
    passport.serializeUser((user: UserModel, done) => done(null, {id: user.id}));
    passport.deserializeUser((user: {id: number}, done) => db.query(UserModel).where(m => m.id.eq(user.id)).findOne().then(user => done(null, user)).catch(err => done(err, null)));

    const app = express();
    app.use(BodyParser.urlencoded({extended: false}));
    app.use(BodyParser.json());
    app.use(session({secret: config.auth.sessionSecret}));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(webpackDevMiddleware(webpack(webpackConfig), {
        publicPath: webpackConfig.output.publicPath
    }));

    app.use(AuthRouter());
    app.use(NoteRouter(db));
    app.use(LabelRouter(db));

    app.use(express.static(staticRoot));
    app.get('*', (req, res) => res.sendFile(path.join(staticRoot, 'index.html')));

    app.listen(8080);
})();