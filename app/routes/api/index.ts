import {libraries} from './library-api'
import {media} from './media-api'
import {labels} from './label-api'
import {notes} from './note-api'
import {profile} from './profile-api'
import {settings} from './settings-api'
import {members} from './members-api'
import {maps} from './maps-api'

import {Request, Response, NextFunction, Router} from 'express'
import {Connection} from 'typeorm'
import {Config} from '../../config'

export function api(conn: Connection, config: Config)
{
    const router = Router()
    router.use(libraries(conn, config))
    router.use(labels(conn))
    router.use(media(conn, config))
    router.use(notes(conn))
    router.use(profile(conn))
    router.use(settings(conn))
    router.use(members(conn, config))
    router.use(maps(conn))
    return router
}