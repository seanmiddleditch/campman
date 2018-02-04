import {Request, Response} from 'express'
import {checkAccess} from '../../auth'
import {MapRepository} from '../../models'
import {connection} from '../../db'
import PromiseRouter = require('express-promise-router')

export function maps()
{
    const router = PromiseRouter()
    const mapRepo = connection().getCustomRepository(MapRepository)

    router.get('/maps', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const all = await mapRepo.findByCampaign({campaignId: req.campaign.id})
        if (!all)
            return res.status(404).render('not-found')

        const filtered = all.filter(map => checkAccess('map:view', {
            profileId: req.profileId,
            role: req.campaignRole
        }))

        const canCreate = checkAccess('map:view', {
            profileId: req.profileId,
            role: req.campaignRole
        })

        res.render('campaign/maps/list', {tags: filtered, canCreate})
    })

    return router
}