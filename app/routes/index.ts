import {noteRouter} from "./note-routes";
import {labelRouter} from "./label-routes";
import {Router} from "express";
import {Database} from "squell";

export function routes(db: Database)
{
    const router = Router();
    router.use(noteRouter(db));
    router.use(labelRouter(db));
    router.get('/', (req, res) => res.render('index.hbs'));
    return router;
}