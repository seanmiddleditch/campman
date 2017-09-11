import {Request, Response, Router} from 'express';
import {LabelModel, NoteModel, LibraryModel} from '../models';
import {Database, ASC} from 'squell';

export default function LabelAPIRouter(db: Database)
{
    const router = Router();

    router.get('/api/labels/list', async (req, res, next) => {
        try
        {
            const libraryId = req.query.library || 1;

            const all = await db.query(LabelModel)
                .attributes(m => [m.slug])
                .include(NoteModel, m => m.notes, q => q.attributes(m => [m.id]).include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.id.eq(libraryId))))
                .order(m => [[m.slug, ASC]])
                .find();

            res.json(all.map(l => ({slug: l.slug, notes: l.notes.length})));
        }
        catch (err)
        {
            console.error(err);
            next(err);
        }
    });

    router.get('/api/labels/get', async (req, res, next) => {
        try
        {
            const slug = req.query.slug;
            const libraryId = req.query.library || 1

            let label = await db.query(LabelModel)
                .attributes(m => [m.id, m.slug])
                .where(m => m.slug.eq(slug))
                .findOne();

            const labelNotes = await db.query(NoteModel)
                .attributes(m => [m.slug, m.title])
                .include(LibraryModel, m => m.library, q => q.where(m => m.id.eq(libraryId)))
                .include(LabelModel, m => m.labels, q => q.where(m => m.id.eq(label.id)))
                .find();

            if (label)
            {
                res.json({slug: label.slug, notes: labelNotes});
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

    return router;
}