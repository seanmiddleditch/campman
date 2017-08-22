import "reflect-metadata";
import * as express from "express";
import * as typeorm from "typeorm";
import {routes} from "./routes";
import {createEngine} from "./util/hb-engine";
import * as BodyParser from "body-parser";
import * as models from "./models/note";

(async () => {
    const connection = await typeorm.createConnection({
        "type": "sqlite",
        "database": "test.db",
        "entities": [
            models.Note,
            models.Label
        ],
        "autoSchemaSync": false
    });

    const app = express();
    app.use(BodyParser.urlencoded({extended: false}));
    app.engine('hbs', createEngine(__dirname + '/../views'));
    app.set('views', __dirname + '/../views');
    app.set('view engine', 'hbs');
    app.use(routes(connection));
    app.listen(8080);
})();