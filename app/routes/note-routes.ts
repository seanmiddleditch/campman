import {Request, Response, Router} from "express";
import {Label, Note} from "../models";
import * as squell from "squell";
import {Converter} from "showdown";
import * as Slug from "../util/slug";

export function noteRouter(db: squell.Database)
{
    const router = Router();
    const converter = new Converter();

    router.get('/notes', async (req, res, next) => {
        try {
            const all = await db.query(Note).order(m => [[m.title, squell.ASC]]).find();
            res.render('notes.hbs', {notes: all});
        } catch (err) {
            console.error(err);
            next();
        }
    })

    router.get('/notes/create', (req, res) => {
        res.render('new-note.hbs');
    });
    router.post('/notes/create', async (req, res, next) => {
        try {
            const note = new Note();
            note.slug = Slug.sanitizeSlug(req.body.slug || req.body.title);
            note.title = req.body.title;
            note.labels = await Label.reify(db, Label.fromString(req.body.labels));
            note.body = req.body.body;

            await db.query(Note).includeAll().create(note);
            res.redirect('/n/' + note.slug);
        } catch (err) {
            console.error(err);
            next();
        }
    });

    router.get('/n/:slug/edit', async (req, res, next) => {
        try {
            const note = await db.query(Note).includeAll().where(m => m.slug.eq(req.params.slug)).findOne();
            if (note) {
                res.render('edit-note.hbs', {note: note});
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
            next();
        }
    });
    router.post('/n/:slug/edit', async (req, res, next) => {
        try {
            const note = await db.query(Note).includeAll().where(m => m.slug.eq(req.params.slug)).findOne();
            if (note) {
                note.slug = Slug.sanitizeSlug(req.body.slug || req.body.title);
                note.title = req.body.title;
                note.labels = await Label.reify(db, Label.fromString(req.body.labels));
                note.body = req.body.body;

                await db.query(Note).includeAll().save(note);
                res.redirect('/n/' + note.slug);
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
            next();
        }
    });

    router.get('/n/:slug', async (req, res, next) => {
        try {
            const note = await db.query(Note).includeAll().where(m => m.slug.eq(req.params.slug)).findOne();
            if (note) {
                res.render('note.hbs', {note: note});
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