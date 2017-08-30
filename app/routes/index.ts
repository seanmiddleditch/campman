import {noteRouter} from "./note-routes";
import {labelRouter} from "./label-routes";
import {Database} from "squell";
import * as express from "express";

export function routes(staticRoot: string, db: Database)
{
    const router = express.Router();
    router.use(noteRouter(db));
    router.use(labelRouter(db));
    router.get('/', (req, res) => res.redirect('/n/home'));
    router.use(express.static(staticRoot));
    return router;
}