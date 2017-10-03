import {Request, Response, Router} from 'express'
import {LibraryModel, LabelModel, NoteModel, UserModel} from '../../models'
import {Database, ASC} from 'squell'
import * as slug from '../../util/slug'
import {Access} from '../../auth/access'
import {wrap, success, notFound, accessDenied, badInput, authorized} from '../helpers'

export function noteAPIRoutes(db: Database)
{
    const router = Router()

    router.get('/api/notes', authorized(db), wrap(async (req) => {
        if (!req.library) return notFound()
        
        const userID = req.user ? req.user.id : null
        const librarySlug = req.library.slug
        const labelSlug = req.query.label
        
        // has to be a cleaner way to write this
        const all = typeof labelSlug === 'string' ?
            await db.query(NoteModel)
                .attributes(m => [m.slug, m.title, m.subtitle])
                .include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.slug.eq(librarySlug)))
                .include(LabelModel, m => [m.labels, {required: true}], q => q.attributes(m => [m.slug]).where(m => m.slug.eq(labelSlug)))
                .order(m => [[m.title, ASC]])
                .find() :
            await db.query(NoteModel)
                .attributes(m => [m.slug, m.title, m.subtitle])
                .include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.slug.eq(librarySlug)))
                .include(LabelModel, m => [m.labels, {required: false}], q => q.attributes(m => [m.slug]))
                .order(m => [[m.title, ASC]])
                .find()

        return success(all.map(n => ({...n, labels: n.labels.map(l => l.slug)})))
    }))

    router.get('/api/notes/:note', authorized(db), wrap(async (req) => {
        if (!req.library) return notFound()
        
        const userID = req.user ? req.user.id : null
        const librarySlug = req.library.slug
        const noteSlug = req.params.note

        const note = await db.query(NoteModel)
            .attributes(m => [m.slug, m.title, m.subtitle, m.rawbody])
            .include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.slug.eq(librarySlug)))
            .include(LabelModel, m => [m.labels, {required: false}], q => q.attributes(m => [m.slug]))
            .where(m => m.slug.eq(noteSlug)).findOne()

        if (!note) return notFound()
        else return success({...note, rawbody: JSON.parse(note.rawbody), labels: note.labels.map(l => l.slug)})
    }))

    router.post('/api/notes/:note', authorized(db, Access.GM), wrap(async (req) => {
        if (!req.library) return notFound()
        
        const userID = req.user ? req.user.id : null
        const librarySlug = req.library.slug
        const noteSlug = req.params.note

        const currentNote = await db.query(NoteModel)
                .include(LibraryModel, m => m.library, m => m.where(m => m.slug.eq(librarySlug)))
                .include(LabelModel, m => [m.labels, {required: false}])
                .where(m => m.slug.eq(noteSlug)).findOne()

        const note = currentNote || new NoteModel()

        note.slug = slug.sanitize(noteSlug)
        if (!slug.isValid(noteSlug))
            return badInput()

        if (!note.library)
            note.library = await db.query(LibraryModel).where(m => m.slug.eq(librarySlug)).findOne()
        if (!note.author && userID)
            note.author = await db.query(UserModel).where(m => m.id.eq(userID)).findOne()

        note.title = req.body['title'] || note.title || 'New Note'
        note.subtitle = req.body['subtitle'] || note.subtitle || ''
        note.rawbody = JSON.stringify(req.body['rawbody']) || note.rawbody || ''
        if (req.body['labels'])
            note.labels = await LabelModel.reify(db, LabelModel.fromString(req.body['labels']))
        if (!note.labels)
            note.labels = []

        await db.query(NoteModel)
            .include(LibraryModel, m => m.library)
            .include(LabelModel, m => m.labels)
            .save(note)

        return success(note)
    }))

    router.delete('/api/notes/:note', authorized(db, Access.GM), wrap(async (req) => {
        if (!req.library) return notFound()
        
        const userID = req.user ? req.user.id : null
        const librarySlug = req.library.slug
        const noteSlug = req.params.note

        const count = await db.query(NoteModel).where(m => m.slug.eq(noteSlug)).destroy()
        if (!count) return notFound()

        return success({count})
    }))

    return router
}