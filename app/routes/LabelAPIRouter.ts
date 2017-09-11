import { Request, Response, Router } from 'express';
import { Label, Note, Library } from '../models';
import { Database, ASC } from 'squell';

export default function LabelAPIRouter(db: Database)
{
    const router = Router();

    router.get('/api/labels/list', async (req, res, next) => {
        try
        {
            const all = await db.query(Label)
                .attributes(m => [m.id, m.slug])
                .include(Note, m => m.notes)
                .order(m => [[m.slug, ASC]])
                .find();
            res.json(all);
        }
        catch (err)
        {
            console.error(err);
            next(err);
        }
    });

    router.get('/api/labels/getBySlug/:slug', async (req, res, next) => {
        try
        {
            const libraryId = req.query.library || 1

            let label = await db.query(Label)
                .include(Note, m => m.notes)
                        //.include(Library, n => n.library, l => l.where(l => l.id.eq(libraryId))))
                .attributes(m => [m.id, m.slug])
                .where(m => m.slug.eq(req.params.slug))
                .findOne();

            if (label)
            {
                res.json(label);
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