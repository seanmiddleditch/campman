import {Request, Response, Router} from 'express'
import {User, UserRepository} from '../../models'
import {wrapper, ok, fail} from '../helpers'
import {checkAccess} from '../../auth'
import {Connection} from 'typeorm'

export function profile(connection: Connection)
{
    const router = Router()

    const userRepository = connection.getCustomRepository(UserRepository)

    router.post('/api/profile', wrapper(async (req, res) => {
        if (!req.user)
        {
            fail(res, 403, 'Not logged in')
        }
        else
        {
            await userRepository.updateUser({
                userID: req.userID,
                nickname: req.body.nickname
            })

            ok(res, {})
        }
    }))

    return router
}