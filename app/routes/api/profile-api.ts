import {Request, Response, Router} from 'express'
import {User} from '../../models'
import {wrapper} from '../helpers'
import {checkAccess} from '../../auth'
import {Connection} from 'typeorm'

export function profile(connection: Connection)
{
    const router = Router()

    // router.post('/api/profile', wrapper(async (req, res) => {
    //     if (!req.user)
    //     {
    //         res.status(403).json({message: 'Not logged in'})
    //     }
    //     else
    //     {
    //         const [count, users] = await db.query(User)
    //             .where(m => m.id.eq(req.userID))
    //             .update({
    //                 nickname: req.body['nickname'] || req.user.nickname
    //             })
    //         const updatedUser = users[0]
    //         if (req.user)
    //             req.user.nickname = updatedUser.nickname
    //         res.status(200).json({nickname: updatedUser.nickname})
    //     }
    // }))

    return router
}