import {Request, Response} from 'express'
import {checkAccess} from '../../auth'
import {CampaignRepository} from '../../models'
import {connection} from '../../db'
import {URL} from 'url'
import {config} from '../../config'
import PromiseRouter = require('express-promise-router')
import * as slugUtils from '../../util/slug-utils'

export function settings()
{
    const campaignRepository = connection().getCustomRepository(CampaignRepository)
    const router = PromiseRouter()

    router.get('/settings', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess({target: 'campaign:configure', hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).json({status: 'access denied'})
            return
        }

        const campaign = await campaignRepository.findOneById(req.campaign.id)
        if (!campaign)
            throw new Error('Failed to load campaign for settings')

        res.render('campaign/settings', {campaign})
    })

    router.post('/settings', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess({target: 'campaign:configure', hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).json({status: 'access denied'})
            return
        }

        const campaign = await campaignRepository.findOneById(req.campaign.id)
        if (!campaign)
            throw new Error('Failed to load campaign for settings')

        campaign.title = req.body['title'] || campaign.title
        campaign.slug = req.body['slug'] ? slugUtils.sanitize(req.body['slug']) : campaign.slug

        if (!slugUtils.isLegal(campaign.slug))
        {
            res.status(400).json({status: 'Illegal slug', fields: {slug: 'Must only be letters, numbers, and dashes.'}})
            return
        }

        await campaignRepository.save(campaign)

        if (campaign.slug !== req.campaign.slug)
        {
            const url = new URL('/', config.publicURL)
            url.host = `${campaign.slug}.${url.host}`
            res.redirect(url.toString(), 307)
        }
        else
        {
            res.redirect('/settings')
        }
    })

    return router
}