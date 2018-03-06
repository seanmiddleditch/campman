import PromiseRouter = require('express-promise-router')
import { CampaignRepository } from '../../../../models'
import { connection } from '../../../../db'
import { members } from './members'
import { files } from './files'

async function index()
{
    
}

export function campaigns()
{
    const campaignRepository = connection().getCustomRepository(CampaignRepository)

    const router = PromiseRouter()
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
            visibility: campaign.visibility
        }})
    })
    return router
}