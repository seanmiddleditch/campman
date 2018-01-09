import {Request, Response, Router} from 'express'
import * as express from 'express'
import {wrapper, ok, fail} from '../helpers'
import {Library, Map, MapRepository} from '../../models'
import {checkAccess} from '../../auth'
import {Connection} from 'typeorm'

export function maps(connection: Connection)
{
    const router = Router()
    const mapRepository = connection.getCustomRepository(MapRepository)

    router.get('/api/maps', wrapper(async (req, res) => {
        if (!req.library)
        {
            fail(res, 404, 'Library not found')
        }
        else if (!checkAccess({target: 'maps:list', hidden: false, userID: req.userID, role: req.userRole}))
        {
            fail(res, 403, 'Permission denied')
        }
        else
        {
            const media = await mapRepository.findAllByLibrary({libraryID: req.libraryID})

            ok(res, media.map(m => ({
                id: m.id,
                title: m.title,
                mediaURL: m.media && m.media.path
            })))
        }
    }))

    return router
}
