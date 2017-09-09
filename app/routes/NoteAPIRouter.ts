import {Request, Response, Router} from "express";
import {Library, Label, Note} from "../models";
import * as squell from "squell";
import * as Slug from "../util/slug";

export default function NoteAPIRouter(db: squell.Database)
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

    router.get('/api/notes/fetch', async (req, res, next) => {
        try
        {
            const libraryId = req.query.library || 1;
            const slug = req.query.slug;

            if (!slug)
            {
                return res.status(400).end();
            }

            //const library = await db.query(Library).where(m => m.id.eq(libraryId)).findOne();
            //.include(() => Library, m => m.library.eq(libraryId))
            const note = await db.query(Note).includeAll().where(m => m.slug.eq(slug)).findOne();

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
            res.status(500).end();
        }
    });

    router.post('/api/notes/update', async (req, res, next) => {
        try
        {
            const slug = req.body.slug;
            if (!slug)
            {
                return res.status(400).end();
            }

            const note = (await db.query(Note).includeAll().where(m => m.slug.eq(slug)).findOne()) || Note.createWithSlug(slug);
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
            if (!slug)
            {
                return res.status(400).end();
            }
    
            const count = await db.query(Note).where(m => m.slug.eq(slug)).destroy();
            res.status(count ? 204 : 404).end();
        }
        catch (err)
        {
            console.error(err);
            next(err);
        }
    });

    return router;
}