import {Request, Response, Router} from 'express';
import {LabelModel, NoteModel, LibraryModel} from '../../models';
import {Database, ASC} from 'squell';
import * as helpers from '../helpers';
import Access from '../../auth/access';

export default function LabelAPIRoutes(db: Database)
{
    const router = Router();

    router.get('/api/labels', helpers.authorized(db), helpers.wrap(async (req) => {
        if (!req.library) return helpers.notFound();

        const librarySlug = req.library.slug;

        const all = await db.query(LabelModel)
                .attributes(m => [m.slug])
                .include(NoteModel, m => m.notes, q => q.attributes(m => [m.id]).include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.slug.eq(librarySlug))))
                .order(m => [[m.slug, ASC]])
                .find()

        return helpers.success(all.map(l => ({slug: l.slug, numNotes: l.notes.length})));
    }));

    router.get('/api/labels/:label', helpers.authorized(db), helpers.wrap(async (req) => {
        if (!req.library) return helpers.notFound();
        
        const labelSlug = req.params.label;
        const librarySlug = req.library.slug;

        const [label, notes] = await Promise.all([
            db.query(LabelModel)
                .attributes(m => [m.slug])
                .where(m => m.slug.eq(labelSlug))
                .findOne(),
            db.query(NoteModel)
                .attributes(m => [m.slug, m.title])
                .include(LibraryModel, m => m.library, q => q.where(m => m.slug.eq(librarySlug)))
                .include(LabelModel, m => m.labels, q => q.where(m => m.slug.eq(labelSlug)))
                .find()
        ]);

        if (!label) return helpers.notFound();
        else return helpers.success({slug: label, notes});
    }));

    return router;
}