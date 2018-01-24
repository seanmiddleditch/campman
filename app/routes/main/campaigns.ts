import PromiseRouter = require('express-promise-router')
import {CampaignModel, CampaignRepository} from '../../models/campaign'
import {connection} from '../../db'
import {config} from '../../config'
import {URL} from 'url'
import * as slugUtils from '../../util/slug-utils'
import {QueryFailedError} from 'typeorm'

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

    router.get('/campaigns/new', async (req, res, next) => {
        if (req.campaign)
            return next()

        res.render('new-campaign')
    })

    router.post('/campaigns', async (req, res, next) => {
        if (req.campaign)
            return next()

        const title = req.body['title'] as string|undefined
        let slug = req.body['slug'] as string|undefined

        if (!title)
            return res.render('new-campaign', {campaign: {title, slug}, errors: {title: 'A title must be provided'}})
            
        if (!slug)
            slug = slugUtils.sanitize(title)

        if (!slug)
            return res.render('new-campaign', {campaign: {title, slug}, errors: {slug: 'A slug must be provided'}})
        else if (!slugUtils.isValid(slug))
            return res.render('new-campaign', {campaign: {title, slug}, errors: {slug: 'Invalid characters in slug'}})
        else if (!slugUtils.isValid(slug))
            return res.render('new-campaign', {campaign: {title, slug}, errors: {slug: 'Not available'}})

        try
        {
            const campaign = await CampaignRepository.createNewCampaign(connection(), {slug, title, profileId: req.user.id})
            const url = new URL('/', config.publicURL)
            url.host = `${campaign.slug}.${url.host}`
            res.redirect(url.toString())
        }
        catch (err)
        {
            if (err instanceof QueryFailedError)
                return res.render('new-campaign', {campaign: {title, slug}, errors: {slug: 'Not available'}})
            else
                throw err
        }
    })

    return router
}