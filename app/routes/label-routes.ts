import {Request, Response, Router} from "express";
import {Label, Note} from "../models/note";
import {Connection} from "typeorm";
import {Converter} from "showdown";

export function labelRouter(connection: Connection)
{
    const router = Router();
    const converter = new Converter();
    const labels = connection.getRepository(Label);

    router.get('/labels', async (req, res, next) => {
        try {
            const all = await labels.find();
            res.render('labels.hbs', {labels: all});
        } catch (err) {
            console.error(err);
            next();
        }
    });

    router.get('/l/:slug', async (req, res, next) => {
        try {
            const label = await labels.findOne({where: {slug: req.params.slug}, relations: ['notes']});
            if (label) {
                res.render('label.hbs', {label: label});
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
            next();
        }
    });

    return router;
}