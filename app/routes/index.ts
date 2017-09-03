import {noteRouter} from "./note-routes";
import {labelRouter} from "./label-routes";
import {Database} from "squell";
import * as express from "express";

export function routes(db: Database)
{
    const router = express.Router();
    router.use(noteRouter(db));
    router.use(labelRouter(db));
    return router;
}