import PromiseRouter = require('express-promise-router')
import {checkAccess, CampaignRole} from '../../auth'
import {InvitationRepository} from '../../models/invitation-model'
import {connection} from '../../db'
import {config} from '../../config'
import {URL} from 'url'
import {QueryFailedError} from 'typeorm'
import {JoinCampaign} from '../../../components/pages/join-campaign'
import {render} from '../../util/react-ssr'

export function join() {
    const router = PromiseRouter()
    const invitationRepository = connection().getCustomRepository(InvitationRepository)

    router.get('/join/:code', async (req, res, next) => {
        const code = req.params['code']

        if (!req.user)
        {
            render(res, JoinCampaign, {success: false, error: 'Please login to join.'})
            return
        }

        try
        {
            const result = await InvitationRepository.acceptInvite(connection(), {
                code,
                profileId: req.user.id
            })
            if (result)
                render(res, JoinCampaign, {success: true})
            else
                render(res, JoinCampaign, {success: false, error: 'Expired or invalid code.'})
        }
        catch (e)
        {
            console.error(e)
            render(res, JoinCampaign, {success: false, error: 'Expired or invalid code.'})
        }
    })

    return router
}