import {Request, Response, Router} from 'express'
import {wrapper, ok, fail} from '../helpers'
import {checkAccess} from '../../auth'
import {NoteVisibility, NoteRepository} from '../../models'
import * as slug from '../../util/slug'
import {draftToHtml} from '../../util/draft-to-html'
import {Connection} from 'typeorm'

export function notes(conn: Connection)
{
    const router = Router()
    const noteRepository = conn.getCustomRepository(NoteRepository)

    router.get('/api/notes', wrapper(async (req, res) => {
        if (!req.libraryID)
        {
            fail(res, 404, 'Library not found')
        }
        else
        {
            const notes = await noteRepository.listNotes(req)

            ok(res, notes.filter(note => checkAccess({
                target: 'note:view',
                userID: req.userID,
                role: req.userRole,
                ownerID: note.authorID,
                hidden: note.visibility !== NoteVisibility.Public
            })).map(note => ({
                ...note,
                editable: checkAccess({target: 'note:edit', userID: req.userID, role: req.userRole, ownerID: note.authorID, hidden: note.visibility !== NoteVisibility.Public})
            })))
        }
    }))

    router.get('/api/notes/:note', wrapper(async (req, res) => {
        if (!req.libraryID)
        {
            fail(res, 404, 'Library not found')
        }
        else
        {
            const note = await noteRepository.fetchBySlug({slug: req.params['note'], libraryID: req.libraryID})
            if (!note)
            {
                fail(res, 404, 'Note not found')
            }
            else if (!checkAccess({target: 'note:view', userID: req.userID, role: req.userRole, ownerID: note.authorID, hidden: note.visibility !== NoteVisibility.Public}))
            {
                fail(res, 403, 'Access denied')
            }
            else
            {
                const {slug, title, subtitle, rawbody, labels, visibility, type} = note

                const secrets = checkAccess({
                    target: 'note:view-secret',
                    userID: req.userID,
                    role: req.userRole,
                    ownerID: note.authorID,
                    hidden: note.visibility !== NoteVisibility.Public
                })
                const editable = checkAccess({
                    target: 'note:edit',
                    userID: req.userID,
                    role: req.userRole,
                    ownerID: note.authorID,
                    hidden: note.visibility !== NoteVisibility.Public
                })

                const body = draftToHtml(rawbody, secrets)
                ok(res, {slug, title, subtitle, body, rawbody: editable ? rawbody : undefined, labels, visibility, type, editable})
            }
        }
    }))

    router.post('/api/notes/:note', wrapper(async (req, res) => {
        if (!req.libraryID)
        {
            fail(res, 404, 'Library not found')
        }
        else
        {
            const note = await noteRepository.fetchBySlug({slug: req.params['note'], libraryID: req.libraryID})
            if (note && !checkAccess({target: 'note:edit', userID: req.userID, role: req.userRole, ownerID: note.authorID, hidden: note.visibility !== NoteVisibility.Public}))
            {
                fail(res, 403, 'Access denied')
            }
            else if (!note && !checkAccess({target: 'note:create', userID: req.userID, role: req.userRole}))
            {
                fail(res, 403, 'Access denied')
            }
            else
            {
                const slug = req.params['note']
                const libraryID = req.libraryID
                const {title, subtitle, visibility, labels} = req.body
                const rawbody = req.body['rawbody'] ? JSON.stringify(req.body['rawbody']) : ''

                await noteRepository.updateNote({
                    slug,
                    libraryID,
                    title,
                    subtitle,
                    rawbody,
                    labels,
                    visibility
                })

                ok(res, {
                    slug,
                    libraryID,
                    title: title || note.title,
                    subtitle: subtitle || note.subtitle,
                    rawbody: rawbody || note.rawbody,
                    labels: labels || note.labels,
                    visibility: visibility || note.visibility
                })
            }
        }
    }))

    // router.delete('/api/notes/:note', wrapper(async (req, res) => {
    //     if (!req.libraryID)
    //     {
    //         res.status(404).json({message: 'Library not found'})
    //     }
    //     else
    //     {
    //         const result = await controller.fetchNote({noteSlug: req.params['note'], libraryID: req.libraryID})
    //         if (!result.note)
    //         {
    //             res.status(404).json({message: 'Note not found'})
    //         }
    //         else if (!checkAccess({target: 'note:delete', userID: req.userID, role: req.userRole, ownerID: result.note.authorID}))
    //         {
    //             res.status(403).json({message: 'Access denied'})
    //         }
    //         else
    //         {
    //             const count = await controller.deleteNote({noteSlug: req.params['note'], libraryID: req.libraryID})
    //             res.json({deleted: count.deleted})
    //         }
    //     }
    // }))

    return router
}