import {Request, Response, Router} from 'express'
import {Database} from 'squell'
import {UserModel} from '../../models'
import {wrapper} from '../helpers'
import {checkAccess} from '../../auth'

export function profileAPIRoutes(db: Database)
{
    const router = Router()

    router.post('/api/profile', wrapper(async (req, res) => {
        if (!req.user)
        {
            res.status(403).json({message: 'Not logged in'})
        }
        else
        {
            const [count, users] = await db.query(UserModel)
                .where(m => m.id.eq(req.userID))
                .update({
                    nickname: req.body['nickname'] || req.user.nickname
                })
            const updatedUser = users[0]
            if (req.user)
                req.user.nickname = updatedUser.nickname
            res.status(200).json({nickname: updatedUser.nickname})
        }
    }))

    return router
}