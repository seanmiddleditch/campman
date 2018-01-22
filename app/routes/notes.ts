import PromiseRouter = require('express-promise-router')
import {NoteModel, NoteRepository, NoteVisibility} from '../models/note-model'
import {LabelRepository} from '../models/label-model'
import {connection} from '../db'
import {config} from '../config'
import {URL} from 'url'
import {checkAccess} from '../auth'
import {draftToHtml} from '../util/draft-to-html'

export function notes() {
    const router = PromiseRouter()
    const noteRepo = connection().getCustomRepository(NoteRepository)
    const labelRepo = connection().getCustomRepository(LabelRepository)

    router.get('/notes', async (req, res, next) => {
        if (!req.library)
        {
            return next()
        }

        const all = await noteRepo.findNotesForLibrary({libraryID: req.libraryID})

        const canCreate = checkAccess({target: 'note:create', userID: req.userID, role: req.userRole})

        res.render('list-notes', {
            notes: all.filter(note => checkAccess({
                target: 'note:view',
                userID: req.userID,
                role: req.userRole,
                ownerID: note.authorID,
                hidden: note.visibility !== NoteVisibility.Public
            })).map(note => ({
                ...note,
                editable: checkAccess({target: 'note:edit', userID: req.userID, role: req.userRole, ownerID: note.authorID, hidden: note.visibility !== NoteVisibility.Public})
            })),
            canCreate
        })
    })

    router.get('/notes/new', async (req, res, next) => {
        if (!req.library)
        {
            return next()
        }

        if (!checkAccess({target: 'note:create', userID: req.userID, role: req.userRole}))
        {
            res.status(403)
            res.json({status: 'access denied'})
        }

        res.render('edit-note', {note: {}})
    })

    router.get('/n/:slug/edit', async (req, res, next) => {
        if (!req.library)
        {
            return next()
        }

        const inSlug = req.params['slug'];

        const note = await noteRepo.fetchBySlug({slug: inSlug, libraryID: req.libraryID})
        if (!note)
        {
            res.status(404)
            return res.render('not-found')
        }

        if (!checkAccess({target: 'note:edit', userID: req.userID, role: req.userRole, ownerID: note.authorID, hidden: note.visibility !== NoteVisibility.Public}))
        {
            res.status(403)
            return res.render('access-denied')
        }

        const {slug, title, rawbody, labels, visibility} = note
        res.render('edit-note', {
            note: {slug, title, rawbody, labels, visibility}
        })
    })

    router.get('/n/:slug', async (req, res, next) => {
        if (!req.library)
        {
            return next()
        }

        const inSlug = req.params['slug'];

        const note = await noteRepo.fetchBySlug({slug: inSlug, libraryID: req.libraryID})
        if (!note)
        {
            res.status(404)
            return res.render('not-found')
        }

        if (!checkAccess({target: 'note:view', userID: req.userID, role: req.userRole, ownerID: note.authorID, hidden: note.visibility !== NoteVisibility.Public}))
        {
            res.status(403)
            return res.render('access-denied')
        }

        const {slug, title, rawbody, labels, visibility} = note

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

        res.render('view-note', {
            note: {slug, title, body, rawbody: editable ? rawbody : undefined, labels, visibility, editable}
        })
    })

    router.post('/n/:note', async (req, res, next) => {
        if (!req.library)
        {
            return next()
        }
        
        const note = await noteRepo.fetchBySlug({slug: req.params['note'], libraryID: req.libraryID})

        const libraryID = req.libraryID

        const slug = req.params['note'] as string
        const title = req.body['title'] as string|undefined
        const visibility = req.body['visibility'] as NoteVisibility|undefined
        
        const rawbody = req.body['rawbody']

        const labels = 'labels' in req.body ? labelRepo.fromString(req.body['labels']) : []

        if (note)
        {
            if (!checkAccess({target: 'note:edit', userID: req.userID, role: req.userRole, ownerID: note.authorID, hidden: note.visibility !== NoteVisibility.Public}))
            {
                res.status(403)
                return res.json({status: 'access denied'})
            }

            await noteRepo.updateNote({
                slug,
                libraryID,
                title: title || note.title,
                rawbody: rawbody || '',
                labels,
                visibility: visibility || note.visibility
            })

            res.redirect(`/n/${note.slug}`)
            // return res.json({
            //     status: 'success',
            //     body: {
            //         slug,
            //         libraryID,
            //         title: title || note.title,
            //         subtitle: subtitle || note.subtitle,
            //         rawbody: rawbody || note.rawbody,
            //         labels: labels || note.labels,
            //         visibility: visibility || note.visibility
            //     }
            // })
        }
        else
        {
            if (!checkAccess({target: 'note:create', userID: req.userID, role: req.userRole}))
            {
                res.status(403)
                res.json({status: 'access denied'})
            }

            const note = await noteRepo.createNote({
                slug,
                authorID: req.userID,
                libraryID,
                title,
                rawbody,
                labels,
                visibility: visibility || NoteVisibility.Public
            })

            res.redirect(`/n/${note.slug}`)
            // res.json({
            //     status: 'success',
            //     body: {
            //         slug,
            //         libraryID,
            //         title: note.title,
            //         subtitle: note.subtitle,
            //         rawbody: note.rawbody,
            //         labels: note.labels,
            //         visibility: note.visibility
            //     }
            // })
        }
    })

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