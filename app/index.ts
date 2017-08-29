import "reflect-metadata";
import * as express from "express";
import {routes} from "./routes";
import {createEngine} from "./util/hb-engine";
import * as BodyParser from "body-parser";
import * as models from "./models";
import * as squell from "squell";
import * as path from "path";

(async () => {
    const dbPath = 'test.db';
    const db = new squell.Database('sqlite://' + dbPath, {dialect: 'sqlite', database: dbPath});

    db.define(models.Note);
    db.define(models.Label);

    await db.sync();

    const root = path.join(__dirname, '..');
    const viewsRoot = path.join(root, 'views');
    const staticRoot = path.join(root, 'static');

    const app = express();
    app.use(BodyParser.urlencoded({extended: false}));
    app.engine('hbs', createEngine(viewsRoot));
    app.set('views', viewsRoot);
    app.set('view engine', 'hbs');
    app.use(routes(staticRoot, db));
    app.listen(8080);
})();