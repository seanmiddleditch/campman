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
        try
        {
            const all = await db.query(Note).order(m => [[m.title, squell.ASC]]).find();
            res.render('notes.hbs', {notes: all});
        }
        catch (err)
        {
            console.error(err);
            next();
        }
    });

    router.get('/n/:slug', async (req, res, next) => {
        try
        {
            const slug = Slug.sanitizeSlug(req.params.slug);
            if (slug != req.params.slug)
            {
                res.redirect(308, '/n/' + slug);
                return;
            }

            let note = await Note.findBySlug(db, slug);
            if (note)
            {
                res.render('note.hbs', {note: note});
            }
            else
            {
                note = new Note();
                note.slug = slug;
                
                res.render('note.hbs', {note: note});
            }
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    });

    router.post('/n/:slug', async (req, res, next) => {
        try
        {
            const slug = Slug.sanitizeSlug(req.params.slug);
            if (slug != req.params.slug)
            {
                res.redirect(308, '/n/' + slug);
                return;
            }

            let note = await Note.findBySlug(db, slug) || Note.createWithSlug(slug);
            if (req.body.title)
                note.title = req.body.title;
            if (req.body.labels)
                note.labels = await Label.reify(db, Label.fromString(req.body.labels));
            if (req.body.body)
                note.body = req.body.body;

            await db.query(Note).includeAll().save(note);
            res.status(204).end();
        }
        catch (err)
        {
            console.error(err);
            res.status(500).end();
        }
    });

    router.delete('/n/:slug', async (req, res, next) => {
        try
        {
            const slug = Slug.sanitizeSlug(req.params.slug);
            let note = await Note.findBySlug(db, slug);
            if (note)
            {
                await db.query(Note).where(m => m.id.eq(note.id)).destroy();
                res.status(204).end();
            }
            else
            {
                next();
            }
        }
        catch (err)
        {
            console.error(err);
            next();
        }
    });

    return router;
}