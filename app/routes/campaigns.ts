import PromiseRouter = require('express-promise-router')
import {CampaignModel, CampaignRepository} from '../models/campaign'
import {connection} from '../db'
import {config} from '../config'
import {URL} from 'url'

export function campaigns() {
    const router = PromiseRouter()
    const campaignRepository = connection().getCustomRepository(CampaignRepository)

    router.get('/campaigns', async (req, res, next) => {
        if (req.campaign)
            return next()

        const all = await campaignRepository.findAllForProfile({profileId: req.profileId})

        res.render('campaigns', {campaigns: all.map(lib => ({
            ...lib,
            publicURL: (new URL(`${config.publicURL.protocol}//${lib.slug}.${config.publicURL.hostname}:${config.publicURL.port}`).toString())
        }))})
    })
    return router
}