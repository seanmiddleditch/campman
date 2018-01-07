import {Connection} from 'typeorm'
import {Request, Response, Router} from 'express'
import {Library, LibraryRepository, LibraryVisibility, Membership, User, Invitation} from '../../models'
import {checkAccess, Role} from '../../auth/access'
import {Config} from '../../config'
import {wrapper, ok, fail} from '../helpers'

export function libraries(conn: Connection, config: Config)
{
    const router = Router()

    const libraryRepository = conn.getCustomRepository(LibraryRepository)

    router.get('/api/libraries', wrapper(async (req, res) => {
        const libraries = await libraryRepository.findAllForUser({userID: req.userID})

        ok(res, libraries)
    }))

    router.get('/api/libraries/:library', wrapper(async (req, res) => {
        const librarySlug = req.params.library

        const library = await libraryRepository.findBySlug({slug: librarySlug})

        if (!library)
        {
            fail(res, 404, 'Not found')
        }
        else if (!checkAccess({target: 'library:view', userID: req.userID, role: req.userRole}))
        {
            fail(res, 403, 'Access denied')
        }
        else
        {
            ok(res, {slug: library.slug, title: library.title, role: req.userRole})
        }
    }))

    router.put('/api/libraries/:library', wrapper(async (req, res) => {
        if (!checkAccess({target: 'library:create', userID: req.userID, role: Role.Visitor}))
        {
            res.status(403).json({message: 'Access denied'})
        }
        else
        {
            const slug = req.params.library
            const title = req.body.title

            if (!slug.isValid(slug))
            {
                res.status(400).json({message: 'Invalid slug'})
            }

            const library = await LibraryRepository.createLibrary(conn, {
                slug,
                title,
                creatorID: req.userID
            })

            ok(res, library)
        }
    }))

    return router
}