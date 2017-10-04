import {Request, Response, Router} from 'express'
import {LibraryModel, LabelModel, NoteModel, UserModel} from '../../models'
import {Database, ASC} from 'squell'
import * as slug from '../../util/slug'
import {Access} from '../../auth/access'
import {wrap, success, notFound, accessDenied, badInput, authorized} from '../helpers'
import {NoteController} from '../../controllers/note-controller'

export function noteAPIRoutes(db: Database)
{
    const router = Router()
    const controller = new NoteController(db)

    router.get('/api/notes', authorized(db), wrap(async (req) => {
        if (!req.library) return notFound() 
        
        const result = await controller.listNotes({librarySlug: req.library.slug})
        return success(result.notes)
    }))

    router.get('/api/notes/:note', authorized(db), wrap(async (req) => {
        if (!req.library) return notFound()

        const note = await controller.fetchNote({noteSlug: req.params['note'], librarySlug: req.library.slug})

        if (!note) return notFound()
        else return success(note)
    }))

    router.post('/api/notes/:note', authorized(db, Access.GM), wrap(async (req) => {
        if (!req.library) return notFound()
        if (!slug.isValid(req.params['note']))
            return badInput()

        const updatedNote = await controller.updateNote({
            noteSlug: req.params['note'],
            librarySlug: req.library.slug,
            noteData: {
                title: req.body['title'],
                subtitle: req.body['subtitle'],
                rawbody: req.body['rawbody'],
                labels: req.body['labels']
            }
        })

        // if (!note.library)
        //     note.library = await db.query(LibraryModel).where(m => m.slug.eq(librarySlug)).findOne()
        // if (!note.author && userID)
        //     note.author = await db.query(UserModel).where(m => m.id.eq(userID)).findOne()

        return success({})
    }))

    router.delete('/api/notes/:note', authorized(db, Access.GM), wrap(async (req) => {
        if (!req.library) return notFound()
        
        const result = await controller.deleteNote({noteSlug: req.params['note'], librarySlug: req.library.slug})

        if (!result.deleted) return notFound()
        return success({count: result.deleted})
    }))

    return router
}