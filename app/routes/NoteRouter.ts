import {Request, Response, Router} from 'express';
import {LibraryModel, LabelModel, NoteModel} from '../models';
import {Database, ASC} from 'squell';
import * as Slug from '../util/slug';
import {requireAuth} from '../auth/middleware';

export default function NoteAPIRouter(db: Database)
{
    const router = Router();

    router.get('/api/notes/list', async (req, res) => {
        try
        {
            const libraryId = req.query.library || 1;

            const all = await db.query(NoteModel)
                .attributes(m => [m.id, m.slug, m.title, m.body])
                .include(LibraryModel, m => m.library, q => q.attributes(m => [m.id]).where(m => m.id.eq(libraryId)))
                .include(LabelModel, m => m.labels, q => q.attributes(m => [m.id, m.slug]))
                .order(m => [[m.title, ASC]])
                .find();

            res.json(all.map(n => ({slug: n.slug, title: n.title, body: n.body, labels: n.labels.map(l => l.slug)})));
        }
        catch (err)
        {
            res.sendStatus(500);
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

            const note = await db.query(NoteModel)
                .include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.id.eq(libraryId)))
                .include(LabelModel, m => m.labels)//, q => q.attributes(m => [m.slug]))
                .where(m => m.slug.eq(slug)).findOne();

            if (note)
            {
                res.json({...note, labels: note.labels.map(l => l.slug)});
            }
            else
            {
                res.sendStatus(404);
            }
        }
        catch (err)
        {
            res.sendStatus(500);
            console.error(err, err.stack);
        }
    });

    router.post('/api/notes/update', requireAuth(), async (req, res) => {
        try
        {
            const libraryId = req.query.library || 1;
            const slug = req.body.slug;

            if (!slug)
            {
                return res.sendStatus(400);
            }

            const note = (await db.query(NoteModel)
                .include(LibraryModel, m => m.library, m => m.where(m => m.id.eq(libraryId)))
                .include(LabelModel, m => m.labels)
                .where(m => m.slug.eq(slug)).findOne()) || NoteModel.createWithSlug(slug);

            if (!note.library)
            {
                note.library = await db.query(LibraryModel).findById(libraryId);
                if (!note.library)
                    return res.sendStatus(400);
            }

            note.title = req.body.title || note.title;
            if (req.body.labels)
                note.labels = await LabelModel.reify(db, LabelModel.fromString(req.body.labels));
            note.body = req.body.body || note.body;

            await db.query(NoteModel)
                .include(LibraryModel, m => m.library)
                .include(LabelModel, m => m.labels)
                .save(note);

            res.json({});
        }
        catch (err)
        {
            res.sendStatus(500);
            console.error(err, err.stack);
        }
    });

    router.delete('/api/notes/delete', requireAuth(), async (req, res) => {
        try
        {
            const slug = req.body.slug;
            if (!slug)
            {
                return res.sendStatus(400);
            }
    
            const count = await db.query(NoteModel).where(m => m.slug.eq(slug)).destroy();
            res.sendStatus(count ? 204 : 404);
        }
        catch (err)
        {
            res.sendStatus(500);
            console.error(err, err.stack);
        }
    });

    return router;
}