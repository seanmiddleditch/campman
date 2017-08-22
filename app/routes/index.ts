import {noteRouter} from "./note-routes";
import {labelRouter} from "./label-routes";
import {Router} from "express";
import {Connection} from "typeorm";

export function routes(connection: Connection)
{
    const router = Router();
    router.use(noteRouter(connection));
    router.use(labelRouter(connection));
    router.get('/', (req, res) => res.render('index.hbs'));
    return router;
}