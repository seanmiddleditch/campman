import PromiseRouter = require('express-promise-router')
import {checkAccess, CampaignRole} from '../../auth'
import {InvitationRepository} from '../../models/invitation-model'
import {connection} from '../../db'
import {config} from '../../config'
import {URL} from 'url'
import {QueryFailedError} from 'typeorm'

export function join() {
    const router = PromiseRouter()
    const invitationRepository = connection().getCustomRepository(InvitationRepository)

    router.get('/join/:code', async (req, res, next) => {
        const code = req.params['code']

        const invitation = await invitationRepository.findOneById(code)
        if (!invitation)
        {
            res.status(404).render('not-found')
            return
        }

        if (!req.user)
        {
            res.status(403).render('access-denied')
            return
        }

        try
        {
            const result = await InvitationRepository.acceptInvite(connection(), {
                code,
                profileId: req.user.id
            })
        }
        catch (e)
        {
            res.status(404).render('not-found')
            return
        }

        res.render('campaign/join')
    })

    return router
}