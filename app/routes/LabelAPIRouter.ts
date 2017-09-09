import { Request, Response, Router } from 'express';
import { Label, Note } from '../models';
import { Database, ASC } from 'squell';

export default function LabelAPIRouter(db: Database)
{
    const router = Router();

    router.get('/api/labels/list', async (req, res, next) => {
        try
        {
            const all = await db.query(Label).order(m => [[m.slug, ASC]]).find();
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
            let label = await db.query(Label).where(m => m.slug.eq(req.params.slug)).includeAll().findOne();
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