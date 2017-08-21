import {noteRouter} from "./note-routes";
import {Router} from "express";
import {Connection} from "typeorm";

export function routes(connection: Connection)
{
    const router = Router();
    router.use('/notes', noteRouter(connection));
    return router;
}