import {Request, Response, Router} from "express";
import {Label, Note} from "../models";
import * as squell from "squell";
import * as Slug from "../util/slug";

export function noteRouter(db: squell.Database)
{
    const router = Router();

    router.get('/api/notes/list', async (req, res, next) => {
        try
        {
            const all = await db.query(Note).includeAll().order(m => [[m.title, squell.ASC]]).find();
            res.json(all.map(m => ({...m, labels: m.labels.map(l => l.slug)})));
        }
        catch (err)
        {
            console.error(err);
            next(err);
        }
    });

    router.get('/api/notes/getBySlug/:slug', async (req, res, next) => {
        try
        {
            let note = await Note.findBySlug(db, req.params.slug);
            if (note)
            {
                res.json({...note, labels: note.labels.map(l => l.slug)});
            }
            else
            {
                res.status(404).end();
            }
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    router.post('/api/notes/update', async (req, res, next) => {
        try
        {
            const slug = req.body.slug;
            let note = await Note.findBySlug(db, slug) || Note.createWithSlug(slug);
            note.title = req.body.title || note.title;
            if (req.body.labels)
                note.labels = await Label.reify(db, Label.fromString(req.body.labels));
            note.body = req.body.body || note.body;

            await db.query(Note).includeAll().save(note);
            res.status(204).end();
        }
        catch (err)
        {
            console.error(err);
            next(err);
        }
    });

    router.delete('/api/notes/delete', async (req, res, next) => {
        try
        {
            const slug = req.body.slug;
            let note = await Note.findBySlug(db, slug);
            if (note)
            {
                await db.query(Note).where(m => m.id.eq(note.id)).destroy();
                res.status(204).end();
            }
            else
            {
                res.status(404).end();
            }
        }
        catch (err)
        {
            console.error(err);
            next(err);
        }
    });

    return router;
}