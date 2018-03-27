import PromiseRouter = require('express-promise-router')
import {CampaignModel, CampaignRepository, CampaignVisibility} from '../../models/campaign'
import {connection} from '../../db'
import {config} from '../../config'
import {URL} from 'url'
import * as slugUtils from '../../../common/slug-utils'
import {QueryFailedError} from 'typeorm'
import { render, renderMain } from '../../react-ssr'
import {NewCampaign} from '../../../components/pages/new-campaign'
import {AccessDenied} from '../../../components/pages/access-denied'
import {checkAccess, CampaignRole} from '../../auth'
import { CampaignData } from '../../../types'

export function campaigns() {
    const router = PromiseRouter()
    const campaignRepository = connection().getCustomRepository(CampaignRepository)

    router.get('/campaigns', async (req, res, next) => {
        const all = await campaignRepository.findAllForProfile({profileId: req.profileId})

        const campaigns: CampaignData[] = all.filter(camp => checkAccess('campaign:view', {
            hidden: camp.visibility === CampaignVisibility.Hidden,
            profileId: req.profileId,
            role: camp.role
        })).map(camp => ({
            ...camp,
            url: (new URL(`${config.publicURL.protocol}//${camp.slug}.${config.publicURL.hostname}:${config.publicURL.port}`).toString())
        }))

        const canCreate = checkAccess('campaign:create', {profileId: req.profileId, role: CampaignRole.Visitor})

        renderMain(req, res, {
            data: {campaigns: campaigns.reduce((r, c) => ({...r, [c.id]: c}), {}),},
            indices: {campaigns: campaigns.map(c => c.id)}
        })
    })

    router.get('/new-campaign', async (req, res, next) => {
        const all = await campaignRepository.findAllForProfile({profileId: req.profileId})

        if (!checkAccess('campaign:create', {profileId: req.profileId, role: CampaignRole.Visitor}))
        {
            render(res.status(403), AccessDenied, {})
            return
        }

        renderMain(req, res, {})
    })

    router.post('/campaigns', async (req, res, next) => {
        if (!checkAccess('campaign:create', {profileId: req.profileId, role: CampaignRole.Visitor}))
        {
            res.status(403).json({status: 'error', message: 'Access denied.'})
            return
        }

        const title = req.body['title'] as string|undefined
        let slug = req.body['slug'] as string|undefined

        if (!title)
        {
            res.status(400).json({status: 'error', message: 'A title must be provided.', fields: {title: 'Missing'}})
            return
        }
            
        if (!slug)
            slug = slugUtils.sanitize(title)

        if (!slug)
        {
            res.status(400).json({status: 'error', message: 'A slug must be provided', fields: {slug: 'Missing'}})
            return
        }
        else if (!slugUtils.isValid(slug))
        {
            res.status(400).json({status: 'error', message: 'Illegal characters in slug', fields: {slug: 'Invalid input'}})
            return
        }
        else if (!slugUtils.isLegal(slug))
        {
            res.status(400).json({status: 'error', message: 'Slug is not available', fields: {slug: 'Not available'}})
            return
        }

        try
        {
            const campaign = await CampaignRepository.createNewCampaign(connection(), {slug, title, profileId: req.user.id})
            const url = new URL('/', config.publicURL)
            url.host = `${campaign.slug}.${url.host}`
            res.json({status: 'success', message: 'Campaign created', body: {
                title: campaign.title,
                slug: campaign.slug,
                visibility: campaign.visibility,
                url: url.toString()
            }})
        }
        catch (err)
        {
            if (err instanceof QueryFailedError)
            {
                res.status(400).json({status: 'error', message: 'Slug is not available', fields: {slug: 'Not available'}})
            }
            else
            {
                throw err
            }
        }
    })

    return router
}