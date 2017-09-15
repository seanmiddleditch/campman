import {Request, Response, Router} from 'express';
import {LibraryModel, LabelModel, NoteModel} from '../models';
import {Database, ASC} from 'squell';
import * as Slug from '../util/slug';
import Access from '../auth/Access';
import {wrap, success, notFound, accessDenied} from './helpers';

export default function NoteAPIRouter(db: Database)
{
    const router = Router();

    router.get('/api/libraries/:library/notes', wrap(async (req) => {
        const librarySlug = req.params.library;

        if (!req.user) return accessDenied();

        const [access, all] = await Promise.all([
            LibraryModel.findBySlugACL(db, librarySlug, req.user.id, Access.Visitor),
            db.query(NoteModel)
                .attributes(m => [m.slug, m.title])
                .include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.slug.eq(librarySlug)))
                .include(LabelModel, m => [m.labels, {required: false, }], q => q.attributes(m => [m.slug]))
                .order(m => [[m.title, ASC]])
                .find()
        ]);

        if (!access) return accessDenied();
        else return success(all.map(n => ({slug: n.slug, title: n.title, body: n.body, labels: n.labels.map(l => l.slug)})));
    }));

    router.get('/api/libraries/:library/notes/:note', wrap(async (req) => {
        const librarySlug = req.params.library;
        const noteSlug = req.params.note;

        if (!req.user) return accessDenied();

        const [access, note] = await Promise.all([
            LibraryModel.findBySlugACL(db, librarySlug, req.user.id, Access.Visitor),
            db.query(NoteModel)
                .attributes(m => [m.slug, m.title, m.body])
                .include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.slug.eq(librarySlug)))
                .include(LabelModel, m => [m.labels, {required: false}], q => q.attributes(m => [m.slug]))
                .where(m => m.slug.eq(noteSlug)).findOne()
        ]);

        if (!access) return accessDenied();
        else if (!note) return notFound();
        else return success({slug: note.slug, title: note.title, body: note.body, labels: note.labels.map(l => l.slug)});
    }));

    router.post('/api/libraries/:library/notes/:note', wrap(async (req) => {
        const librarySlug = req.params.library;
        const noteSlug = req.params.note;

        if (!req.user) return accessDenied();

        const [access, note] = await Promise.all([
            LibraryModel.findBySlugACL(db, librarySlug, req.user.id, Access.GM),
            db.query(NoteModel)
                .include(LibraryModel, m => m.library, m => m.where(m => m.slug.eq(librarySlug)))
                .include(LabelModel, m => [m.labels, {required: false}])
                .where(m => m.slug.eq(noteSlug)).findOne()
        ]);

        if (!access) return accessDenied();
        else if (!note) return notFound();

        note.title = req.body['title'];
        if (req.body.labels)
            note.labels = await LabelModel.reify(db, LabelModel.fromString(req.body.labels));
        note.body = req.body.body || note.body;

        await db.query(NoteModel)
            .include(LibraryModel, m => m.library)
            .include(LabelModel, m => m.labels)
            .save(note);

        return success(note);
    }));

    router.put('/api/libraries/:library/notes/:note', wrap(async (req) => {
        const librarySlug = req.params.library;
        const noteSlug = req.params.note;

        if (!req.user) return accessDenied();

        const access = await LibraryModel.findBySlugACL(db, librarySlug, req.user.id, Access.Player);

        if (!access) return accessDenied();

        const note = new NoteModel();
        note.slug = noteSlug;
        note.title = req.body.title;
        note.library = access;
        note.labels = await LabelModel.reify(db, LabelModel.fromString(req.body.labels));
        note.body = req.body.body;

        await db.query(NoteModel)
            .include(LibraryModel, m => m.library)
            .include(LabelModel, m => m.labels)
            .save(note);

        return success(note);
    }));

    router.delete('/api/libraries/:library/notes/:note', wrap(async (req) => {
        const librarySlug = req.params.library;
        const noteSlug = req.params.note;

        if (!req.user) return accessDenied();

        const access = await LibraryModel.findBySlugACL(db, librarySlug, req.user.id, Access.GM);

        if (!access) return accessDenied();

        const count = await db.query(NoteModel).where(m => m.slug.eq(noteSlug)).destroy();
        if (!count) return notFound();

        return success({count});
    }));

    return router;
}