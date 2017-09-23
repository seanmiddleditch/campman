import {Request, Response, Router} from 'express';
import {LibraryModel, LabelModel, NoteModel} from '../../models';
import {Database, ASC} from 'squell';
import * as slug from '../../util/slug';
import Access from '../../auth/access';
import {wrap, success, notFound, accessDenied, badInput} from '../helpers';

export default function NoteAPIRoutes(db: Database)
{
    const router = Router();

    router.get('/api/notes', wrap(async (req) => {
        if (!req.user) return accessDenied();
        if (!req.library) return notFound();
        
        const librarySlug = req.library.slug;

        const [access, all] = await Promise.all([
            LibraryModel.findBySlugACL(db, librarySlug, req.user.id, Access.Visitor),
            db.query(NoteModel)
                .attributes(m => [m.slug, m.title, m.subtitle])
                .include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.slug.eq(librarySlug)))
                .include(LabelModel, m => [m.labels, {required: false, }], q => q.attributes(m => [m.slug]))
                .order(m => [[m.title, ASC]])
                .find()
        ]);

        if (!access) return accessDenied();
        else return success(all.map(n => ({...n, labels: n.labels.map(l => l.slug)})));
    }));

    router.get('/api/notes/:note', wrap(async (req) => {
        if (!req.user) return accessDenied();
        if (!req.library) return notFound();
        
        const librarySlug = req.library.slug;
        const noteSlug = req.params.note;

        const [access, note] = await Promise.all([
            LibraryModel.findBySlugACL(db, librarySlug, req.user.id, Access.Visitor),
            db.query(NoteModel)
                .attributes(m => [m.slug, m.title, m.subtitle, m.body])
                .include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.slug.eq(librarySlug)))
                .include(LabelModel, m => [m.labels, {required: false}], q => q.attributes(m => [m.slug]))
                .where(m => m.slug.eq(noteSlug)).findOne()
        ]);

        if (!access) return accessDenied();
        else if (!note) return notFound();
        else return success({...note, labels: note.labels.map(l => l.slug)});
    }));

    router.post('/api/notes/:note', wrap(async (req) => {
        if (!req.user) return accessDenied();
        if (!req.library) return notFound();
        
        const librarySlug = req.library.slug;
        const noteSlug = req.params.note;

        const [access, currentNote] = await Promise.all([
            LibraryModel.findBySlugACL(db, librarySlug, req.user.id, Access.GM),
            db.query(NoteModel)
                .include(LibraryModel, m => m.library, m => m.where(m => m.slug.eq(librarySlug)))
                .include(LabelModel, m => [m.labels, {required: false}])
                .where(m => m.slug.eq(noteSlug)).findOne()
        ]);

        if (!access) return accessDenied();

        const note = currentNote || new NoteModel();

        note.slug = slug.sanitize(noteSlug);
        if (!slug.isValid(noteSlug))
            return badInput();

        note.library = access;

        note.title = req.body['title'] || note.title || 'New Note';
        note.subtitle = req.body['subtitle'] || note.subtitle || '';
        note.body = req.body['body'] || note.body || '';
        if (req.body['labels'])
            note.labels = await LabelModel.reify(db, LabelModel.fromString(req.body['labels']));
        if (!note.labels)
            note.labels = [];

        await db.query(NoteModel)
            .include(LibraryModel, m => m.library)
            .include(LabelModel, m => m.labels)
            .save(note);

        return success(note);
    }));

    router.delete('/api/notes/:note', wrap(async (req) => {
        if (!req.user) return accessDenied();
        if (!req.library) return notFound();
        
        const librarySlug = req.library.slug;
        const noteSlug = req.params.note;

        const access = await LibraryModel.findBySlugACL(db, librarySlug, req.user.id, Access.GM);

        if (!access) return accessDenied();

        const count = await db.query(NoteModel).where(m => m.slug.eq(noteSlug)).destroy();
        if (!count) return notFound();

        return success({count});
    }));

    return router;
}