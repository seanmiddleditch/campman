import {Request, Response, Router} from 'express'
import {LibraryModel, LibraryAccessModel, UserModel} from '../../models'
import * as squell from 'squell'
import {checkAccess, Role} from '../../auth/access'
import {LibraryController} from '../../controllers/library-controller'
import {wrapper} from '../helpers'
import * as slug from '../../util/slug'

export function libraryAPIRoutes(db: squell.Database)
{
    const router = Router()
    const controller = new LibraryController(db)

    router.get('/api/libraries', wrapper(async (req, res) => {
        const userID = req.user && req.user.id

        const result = await controller.listLibraries({userID})

        res.json(result.libraries.filter(library => checkAccess({
            target: 'library:view',
            hidden: true,
            ownerID: library.creatorID,
            role: library.role,
            userID: req.userID
        })).map(library => ({slug: library.slug, title: library.title, role: library.role})))
    }))

    router.get('/api/libraries/:library', wrapper(async (req, res) => {
        const librarySlug = req.params.library

        const library = await db.query(LibraryModel)
            .attributes(m => [m.slug])
            .include(LibraryAccessModel, m => [m.acl, {required: false}], q => q
                .attributes(m => [m.role])
                .where(m => squell.attribute('userId').eq(req.userID).or(squell.attribute('userId').eq(null)))
            )
            .where(m => m.slug.eq(librarySlug))
            .findOne()

        if (!library)
        {
            res.status(404).json({message: 'Library not found'})
        }
        else if (!checkAccess({target: 'library:view', userID: req.userID, role: req.userRole, ownerID: library.creator.id}))
        {
            res.status(403).json({message: 'Access denied'})
        }
        else
        {
            res.json({slug: library.slug, title: library.title, role: req.userRole})
        }
    }))

    router.put('/api/libraries/:library', wrapper(async (req, res) => {
        const userID = req.user && req.user.id
        if (!checkAccess({target: 'library:create', userID, role: Role.Visitor}))
        {
            res.status(403).json({message: 'Access denied'})
        }
        else
        {
            const librarySlug = req.params.library
            const title = req.body.title

            if (!slug.isValid(librarySlug))
            {
                res.status(400).json({message: 'Invalid slug'})
            }

            const library = await db.transaction(async (tx) => {
                const user = await db.query(UserModel).where(m => m.id.eq(userID || 0)).findOne()

                const newLibrary = new LibraryModel()
                newLibrary.slug = librarySlug
                newLibrary.title = title
                newLibrary.creator = user

                const library = await db.query(LibraryModel)
                    .include(UserModel, m => m.creator)
                    .create(newLibrary, {transaction: tx})
                
                const newAccess = new LibraryAccessModel()
                newAccess.library = library
                newAccess.user = user
                newAccess.role = Role.Owner
                const access = await db.query(LibraryAccessModel).includeAll().save(newAccess, {transaction: tx})

                return library
            })

            res.status(201).json(library)
        }
    }))

    router.get('/api/libraries/:library/settings', wrapper(async (req, res) => {
        const userID = req.user && req.user.id
        if (!checkAccess({target: 'library:configure', userID, role: req.userRole}))
        {
            res.status(403).json({message: 'Access denied'})
        }
        else
        {
            const library = await db.query(LibraryModel)
                .where(m => m.slug.eq(req.params['library']))
                .findOne()
            if (!library)
            {
                res.status(404).json({message: 'Library not found'})
            }
            else
            {
                res.status(200).json({
                    slug: library.slug,
                    title: library.title,
                    visibility: library.visibility
                })
            }
        }

    }))

    router.post('/api/libraries/:library/settings', wrapper(async (req, res) => {
        const userID = req.user && req.user.id
        if (!checkAccess({target: 'library:configure', userID, role: req.userRole}))
        {
            res.status(403).json({message: 'Access denied'})
        }
        else
        {
            const [count, libraries] = await db.query(LibraryModel)
                .where(m => m.slug.eq(req.params['library']))
                .update({
                    title: req.body['title'],
                    visibility: req.body['visibility']
                })
            res.status(200).json({})
        }

    }))

    return router
}