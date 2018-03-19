import PromiseRouter = require('express-promise-router')
import { CampaignRepository } from '../../../../models'
import { connection } from '../../../../db'
import { members } from './members'
import { files } from './files'
import { adventures } from './adventures'
import { makeCampaignURL } from '../../../../../common/url-utils'
import { config } from '../../../../config'

export function campaigns()
{
    const campaignRepository = connection().getCustomRepository(CampaignRepository)

    const router = PromiseRouter()
    router.use('/:campaignId/adventures', adventures())
    router.use('/:campaignId/members', members())
    router.use('/:campaignId/files', files())
    router.use('/:campaignId/', async (req, res) => {
        const campaign = await campaignRepository.findOneById(req.params['campaignId'])
        if (!campaign)
            throw new Error('Campaign not found')
        res.json({status: 'success', body: {
            id: campaign.id,
            title: campaign.title,
            slug: campaign.slug,
            visibility: campaign.visibility,
            url: makeCampaignURL({slug: campaign.slug, publicURL: config.publicURL})
        }})
    })
    router.use('/', async (req, res) => {
        const [all, count] = await campaignRepository.findAndCount()
        res.json({status: 'success', body: all.map(c => ({
            id: c.id,
            title: c.title,
            slug: c.slug,
            visibility: c.visibility,
            url: makeCampaignURL({slug: c.slug, publicURL: config.publicURL})
        }))})
    })
    return router
}