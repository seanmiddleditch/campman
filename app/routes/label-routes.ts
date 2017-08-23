import {Request, Response, Router} from "express";
import {Label, Note} from "../models";
import * as squell from "squell";
import {Converter} from "showdown";

export function labelRouter(db: squell.Database)
{
    const router = Router();
    const converter = new Converter();

    router.get('/labels', async (req, res, next) => {
        try {
            const all = await db.query(Label).order(m => [[m.slug, squell.ASC]]).find();
            res.render('labels.hbs', {labels: all});
        } catch (err) {
            console.error(err);
            next();
        }
    });

    router.get('/l/:slug', async (req, res, next) => {
        try {
            const label = await db.query(Label).where(m => m.slug.eq(req.params.slug)).findOne();
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