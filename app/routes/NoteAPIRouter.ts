import {Request, Response, Router} from "express";
import {Library, Label, Note} from "../models";
import {Database, ASC} from 'squell';
import * as Slug from "../util/slug";

export default function NoteAPIRouter(db: Database)
{
    const router = Router();

    router.get('/api/notes/list', async (req, res) => {
        try
        {
            const libraryId = req.query.library || 1;

            const all = await db.query(Note)
                .attributes(m => [m.id, m.slug, m.title, m.body])
                .include(Library, m => m.library, q => q.attributes(m => [m.id]).where(m => m.id.eq(libraryId)))
                .include(Label, m => m.labels)
                .order(m => [[m.title, ASC]])
                .find();

            res.json(all.map(n => ({slug: n.slug, title: n.title, body: n.body, labels: n.labels.map(l => l.slug)})));
        }
        catch (err)
        {
            res.status(500).end();
            console.error(err, err.stack);
        }
    });

    router.get('/api/notes/get', async (req, res) => {
        try
        {
            const libraryId = req.query.library || 1;
            const slug = req.query.slug;

            if (!slug)
            {
                return res.status(400).end();
            }

            const note = await db.query(Note)
                .include(Library, m => m.library, q => q.attributes(m => []).where(m => m.id.eq(libraryId)))
                .include(Label, m => m.labels)//, q => q.attributes(m => [m.slug]))
                .where(m => m.slug.eq(slug)).findOne();

            if (note)
            {
                res.json({...note, labels: note.labels.map(l => l.slug)});
            }
            else
            {
                res.status(404).end();
            }
        }
        catch (err)
        {
            res.status(500).end();
            console.error(err, err.stack);
        }
    });

    router.post('/api/notes/update', async (req, res) => {
        try
        {
            const libraryId = req.query.library || 1;
            const slug = req.body.slug;

            if (!slug)
            {
                return res.status(400).end();
            }

            const note = (await db.query(Note)
                .include(Library, m => m.library, m => m.where(m => m.id.eq(libraryId)))
                .include(Label, m => m.labels)
                .where(m => m.slug.eq(slug)).findOne()) || Note.createWithSlug(slug);

            if (!note.library)
            {
                note.library = await db.query(Library).findById(libraryId);
                if (!note.library)
                    res.status(400).end();
            }

            note.title = req.body.title || note.title;
            if (req.body.labels)
                note.labels = await Label.reify(db, Label.fromString(req.body.labels));
            note.body = req.body.body || note.body;

            await db.query(Note)
                .include(Library, m => m.library)
                .include(Label, m => m.labels)
                .save(note);

            res.status(204).end();
        }
        catch (err)
        {
            res.status(500).end();
            console.error(err, err.stack);
        }
    });

    router.delete('/api/notes/delete', async (req, res) => {
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
            res.status(500).end();
            console.error(err, err.stack);
        }
    });

    return router;
}