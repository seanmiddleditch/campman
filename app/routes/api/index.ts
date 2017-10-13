import {libraryAPIRoutes} from './library-api'
import {mediaAPIRoutes} from './media-api'
import {labelAPIRoutes} from './label-api'
import {noteAPIRoutes} from './note-api'
import {profile} from './profile-api'
import {settings} from './settings-api'
import {members} from './members-api'

import {Request, Response, NextFunction, Router} from 'express'
import {Connection} from 'typeorm'
import {Config} from '../../config'

export function api(conn: Connection, config: Config)
{
    const router = Router()
    router.use(labelAPIRoutes(conn))
    router.use(mediaAPIRoutes(conn, config))
    router.use(noteAPIRoutes(conn))
    router.use(profile(conn))
    router.use(settings(conn))
    router.use(members(conn, config))
    return router
}