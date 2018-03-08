import {Request, Response} from 'express'
import {checkAccess} from '../../auth'
import {AdventureRepository} from '../../models'
import {connection} from '../../db'
import PromiseRouter = require('express-promise-router')
import {render} from '../../util/react-ssr'
import {AccessDenied} from '../../../components/pages/access-denied'
import {NotFound} from '../../../components/pages/not-found'
import {ListAdventures} from '../../../components/pages/list-adventures'
import {NewAdventure} from '../../../components/pages/new-adventure'

export function adventures()
{
    const router = PromiseRouter()
    const adventureRepository = connection().getCustomRepository(AdventureRepository)

    router.get('/adventures', async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const all = await adventureRepository.findForCampaign({campaignId: req.campaign.id})
        if (!all)
        {
            render(res.status(404), NotFound, {})
            return
        }

        const filtered = all.filter(map => checkAccess('adventure:view', {
            profileId: req.profileId,
            role: req.campaignRole
        })).map(m => ({
            id: m.id,
            title: m.title,
            rawbody: JSON.parse(m.rawbody),
            created_at: m.createdAt.toUTCString(),
        }))

        const canCreate = checkAccess('adventure:create', {
            profileId: req.profileId,
            role: req.campaignRole
        })

        render(res, ListAdventures, {adventures: filtered, canCreate})
    })

    router.get('/new-adventure', async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess('adventure:create', {
            profileId: req.profileId,
            role: req.campaignRole
        }))
        {
            render(res.status(403), AccessDenied, {})
            return
        }

        render(res, NewAdventure, {})
    })

    return router
}