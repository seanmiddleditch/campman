import {Request, Response, Router} from 'express';
import {LabelModel, NoteModel, LibraryModel} from '../../models';
import {Database, ASC} from 'squell';
import * as helpers from '../helpers';
import Access from '../../auth/access';

export default function LabelAPIRoutes(db: Database)
{
    const router = Router();

    router.get('/api/libraries/:library/labels', helpers.wrap(async (req) => {
        const librarySlug = req.params.library;

        if (!req.user) return helpers.accessDenied();

        const [access, all] = await Promise.all([
            LibraryModel.findBySlugACL(db, librarySlug, req.user.id, Access.Visitor),
            db.query(LabelModel)
                .attributes(m => [m.slug])
                .include(NoteModel, m => m.notes, q => q.attributes(m => [m.id]).include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.slug.eq(librarySlug))))
                .order(m => [[m.slug, ASC]])
                .find()
        ]);

        if (!access) return helpers.accessDenied();
        else return helpers.success(all.map(l => ({slug: l.slug, notes: l.notes.length})));
    }));

    router.get('/api/libraries/:library/labels/:label', helpers.wrap(async (req) => {
        const librarySlug = req.params.library;
        const labelSlug = req.params.label;

        if (!req.user) return helpers.accessDenied();

        const [access, label, notes] = await Promise.all([
            LibraryModel.findBySlugACL(db, librarySlug, req.user.id, Access.Visitor),
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

        if (!access) return helpers.accessDenied();
        else if (!label) return helpers.notFound();
        else return helpers.success({slug: label, notes});
    }));

    return router;
}