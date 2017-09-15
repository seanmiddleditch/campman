import 'reflect-metadata';

import * as express from 'express';
import * as BodyParser from 'body-parser';
import {Database} from 'squell';
import * as path from 'path';
import * as exphbs   from 'express-handlebars';
import * as fs from 'fs';

import {AuthRouter, LabelRouter, LibraryRouter, NoteRouter} from './routes';
import {LibraryModel, LibraryAccessModel, LabelModel, NoteModel, UserModel} from './models';
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
    readonly webpackDev: boolean;

    constructor()
    {
        this.publicURL = process.env.PUBLIC_URL || 'http://localhost';
        this.port = parseInt(process.env.PORT || 8080, 10);
        this.googleClientID = process.env.GOOGLE_CLIENT_ID;
        this.googleAuthSecret = process.env.GOOGLE_AUTH_SECRET;
        this.sessionSecret = process.env.CM_SESSION_SECRET;
        this.webpackDev = process.env.CM_WEBPACK_DEV === 'true';
        this.redisURL = process.env.REDIS_URL;
        this.databaseURL = process.env.DATABASE_URL;
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
    
    db.define(LibraryModel);
    db.define(LibraryAccessModel);
    db.define(LabelModel);
    db.define(NoteModel);
    db.define(UserModel);

    await db.sync();

    const app = express();
    app.use(BodyParser.urlencoded({extended: false}));
    app.use(BodyParser.json());

    app.engine('handlebars', exphbs({
        defaultLayout: 'main',
        partialsDir: path.join(viewsRoot, 'partials'),
        layoutsDir: path.join(viewsRoot, 'layouts')
    }));
    app.set('view engine', 'handlebars');
    app.set('views', viewsRoot);

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

    app.use(AuthRouter(db, config));
    app.use(NoteRouter(db));
    app.use(LabelRouter(db));
    app.use(LibraryRouter(db));

    if (config.production)
    {
        console.log('Serving /js');
        app.use('/js', express.static(path.join(clientRoot, 'dist')));
    }

    app.use(express.static(staticRoot));
    app.use((req, res) => res.render('index'));

    const server = await app.listen(config.port);
    console.log(`Listening on port ${server.address().port}`);
})().catch(err => {
    console.error(err, err.stack);
    process.exit(1);
});