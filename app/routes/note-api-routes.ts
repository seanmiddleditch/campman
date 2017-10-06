import {Request, Response, Router} from 'express'
import {Database} from 'squell'
import {wrapper} from './helpers'
import {checkAccess} from '../auth'
import {NoteController} from '../controllers/note-controller'
import * as slug from '../util/slug'

export function noteAPIRoutes(db: Database)
{
    const router = Router()
    const controller = new NoteController(db)

    router.get('/api/notes', wrapper(async (req, res) => {
        if (!req.libraryID)
        {
            res.status(404).json({message: 'Library not found'})
        }
        else
        {
            const result = await controller.listNotes({libraryID: req.libraryID})
            res.json(result.notes.filter(note => checkAccess({
                target: 'note:view',
                userID: req.userID,
                role: req.userRole,
                ownerID: note.authorID
            })).map(note => ({slug: note.slug, title: note.title, subtitle: note.subtitle})))
        }
    }))

    router.get('/api/notes/:note', wrapper(async (req, res) => {
        if (!req.libraryID)
        {
            res.status(404).json({message: 'Library not found'})
        }
        else
        {
            const result = await controller.fetchNote({noteSlug: req.params['note'], libraryID: req.libraryID})
            if (!result.note)
            {
                res.status(404).json({message: 'Note not found'})
            }
            else if (!checkAccess({target: 'note:view', userID: req.userID, role: req.userRole, ownerID: result.note.authorID}))
            {
                res.status(403).json({message: 'Access denied'})
            }
            else
            {
                const {note} = result
                const {slug, title, subtitle, rawbody, labels} = note
                res.json({slug, title, subtitle, rawbody, labels})
            }
        }
    }))

    router.post('/api/notes/:note', wrapper(async (req, res) => {
        if (!req.libraryID)
        {
            res.status(404).json({message: 'Library not found'})
        }
        else
        {
            const result = await controller.fetchNote({noteSlug: req.params['note'], libraryID: req.libraryID})
            if (!result.note)
            {
                res.status(404).json({message: 'Note not found'})
            }
            else if (!checkAccess({target: 'note:delete', userID: req.userID, role: req.userRole, ownerID: result.note.authorID}))
            {
                res.status(403).json({message: 'Access denied'})
            }
            else
            {
                const updatedNote = await controller.updateNote({
                    noteSlug: req.params['note'],
                    libraryID: req.libraryID,
                    noteData: {
                        title: req.body['title'],
                        subtitle: req.body['subtitle'],
                        rawbody: req.body['rawbody'],
                        labels: req.body['labels']
                    }
                })

                res.json({})
            }
        }
    }))

    router.delete('/api/notes/:note', wrapper(async (req, res) => {
        if (!req.libraryID)
        {
            res.status(404).json({message: 'Library not found'})
        }
        else
        {
            const result = await controller.fetchNote({noteSlug: req.params['note'], libraryID: req.libraryID})
            if (!result.note)
            {
                res.status(404).json({message: 'Note not found'})
            }
            else if (!checkAccess({target: 'note:delete', userID: req.userID, role: req.userRole, ownerID: result.note.authorID}))
            {
                res.status(403).json({message: 'Access denied'})
            }
            else
            {
                const count = await controller.deleteNote({noteSlug: req.params['note'], libraryID: req.libraryID})
                res.json({deleted: count.deleted})
            }
        }
    }))

    return router
}