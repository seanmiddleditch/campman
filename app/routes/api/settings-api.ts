import {Connection} from 'typeorm'
import {Request, Response, Router} from 'express'
import {Library, LibraryRepository, LibraryVisibility, Membership, User, Invitation} from '../../models'
import {checkAccess, Role} from '../../auth/access'
import {wrapper, ok, fail} from '../helpers'
import * as slug from '../../util/slug-utils'

export function settings(conn: Connection)
{
    const router = Router()

    const libraryRepository = conn.getCustomRepository(LibraryRepository)

    router.get('/api/libraries/:library/settings', wrapper(async (req, res) => {
        const library = await libraryRepository.findBySlug({slug: req.params.library})
        if (!library)
        {
            fail(res, 404, 'Library not found')
        }
        else if (!checkAccess({target: 'library:configure', userID: req.userID, role: req.userRole}))
        {
            fail(res, 403, 'Access denied')
        }
        else
        {
            ok(res, {
                slug: library.slug,
                title: library.title,
                visibility: library.visibility
            })
        }
    }))

    router.post('/api/libraries/:library/settings', wrapper(async (req, res) => {
        if (!checkAccess({target: 'library:configure', userID: req.userID, role: req.userRole}))
        {
            fail(res, 403, 'Access denied')
        }
        else
        {
            await libraryRepository.updateLibrary({
                slug: req.params.library,
                title: req.body['title'],
                visibility: req.body['visibility']
            })
            
            ok(res, {})
        }
    }))

    return router
}