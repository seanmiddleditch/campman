import 'reflect-metadata';
import * as express from 'express';
import {routes} from './routes';
import * as BodyParser from 'body-parser';
import {defineModels} from './models';
import * as squell from 'squell';
import * as path from 'path';
import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';

(async () => {
    const dbPath = 'test.db';
    const db = new squell.Database('sqlite://' + dbPath, {dialect: 'sqlite', database: dbPath});

    defineModels(db);

    await db.sync();

    const root = path.join(__dirname, '..', '..');
    const viewsRoot = path.join(root, 'app', 'views');
    const staticRoot = path.join(root, 'static');

    const webpackConfig = require(path.join(root, 'webpack.config.js'));

    const app = express();
    app.use(BodyParser.urlencoded({extended: false}));
    app.use(BodyParser.json());

    app.use(webpackDevMiddleware(webpack(webpackConfig), {
        publicPath: webpackConfig.output.publicPath
    }));

    app.use(routes(db));

    app.use(express.static(staticRoot));
    app.get('*', (req, res) => res.sendFile(path.join(staticRoot, 'index.html')));

    app.listen(8080);
})();