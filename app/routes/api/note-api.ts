import {Request, Response, Router} from 'express'
import {Database} from 'squell'
import {wrapper} from '../helpers'
import {checkAccess} from '../../auth'
import {NoteController} from '../../controllers/note-controller'
import {NoteVisibility} from '../../models'
import * as slug from '../../util/slug'

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
                ownerID: note.authorID,
                hidden: note.visibility !== NoteVisibility.Public
            })).map(note => ({
                slug: note.slug,
                title: note.title,
                subtitle: note.subtitle,
                visibility: note.visibility,
                type: note.type,
                editable: checkAccess({
                    target: 'note:edit',
                    userID: req.userID,
                    role: req.userRole,
                    ownerID: note.authorID,
                    hidden: note.visibility !== NoteVisibility.Public
                })})))
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
            const {note} = result
            if (!note)
            {
                res.status(404).json({message: 'Note not found'})
            }
            else if (!checkAccess({target: 'note:view', userID: req.userID, role: req.userRole, ownerID: note.authorID, hidden: note.visibility !== NoteVisibility.Public}))
            {
                res.status(403).json({message: 'Access denied'})
            }
            else
            {
                const {slug, title, subtitle, rawbody, labels, visibility, type} = note
                const editable = checkAccess({
                    target: 'note:edit',
                    userID: req.userID,
                    role: req.userRole,
                    ownerID: note.authorID,
                    hidden: note.visibility !== NoteVisibility.Public
                })
                res.json({slug, title, subtitle, rawbody, labels, visibility, type, editable})
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
            const {note} = result
            if (note && !checkAccess({target: 'note:edit', userID: req.userID, role: req.userRole, ownerID: note.authorID, hidden: note.visibility !== NoteVisibility.Public}))
            {
                res.status(403).json({message: 'Access denied'})
            }
            else if (!note && !checkAccess({target: 'note:create', userID: req.userID, role: req.userRole}))
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
                        labels: req.body['labels'],
                        visibility: req.body['visibility']
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