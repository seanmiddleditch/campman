import PromiseRouter = require('express-promise-router')
import {checkAccess, CampaignRole} from '../../auth'
import {InvitationRepository} from '../../models/invitation-model'
import {connection} from '../../db'
import {config} from '../../config'
import {URL} from 'url'
import {QueryFailedError} from 'typeorm'
import {JoinCampaign} from '../../../components/pages/join-campaign'
import { renderMain } from '../../react-ssr'

export function join() {
    const router = PromiseRouter()
    const invitationRepository = connection().getCustomRepository(InvitationRepository)

    router.get('/join/:code', async (req, res, next) => {
        const code = req.params['code']

        if (!req.user)
        {
            renderMain(req, res.status(403), {join: {success: false, error: 'Expired or invalid code.'}})
            return
        }

        try
        {
            const result = await InvitationRepository.acceptInvite(connection(), {
                code,
                profileId: req.user.id
            })
            renderMain(req, res, {join: result ? {success: true} : {success: false, error: 'Expired or invalid code.'}})
        }
        catch (e)
        {
            console.error(e)
            renderMain(req, res, {join: {success: false, error: 'Expired or invalid code.'}})
        }
    })

    return router
}