import PromiseRouter = require('express-promise-router')
import { AdventureRepository } from '../../../../models'
import { connection } from '../../../../db'

export function adventures()
{
    const router = PromiseRouter({mergeParams: true})
    const adventureRepository = connection().getCustomRepository(AdventureRepository)

    router.get('/:id', async (req, res) => {
        const id = req.params['id']
        const one = await adventureRepository.findOne({id, campaignId: req.params['campaignId']})

        res.json({status: 'success', body: one ? {
            id: one.id,
            title: one.title,
            rawbody: one.rawbody,
            created_at: one.createdAt,
            visible: one.visible
        } : null})
    })

    router.get('/', async (req, res) => {
        const all = await adventureRepository.findForCampaign({campaignId: req.params['campaignId']})

        res.json({status: 'success', body: all.map(one => ({
            id: one.id,
            title: one.title,
            rawbody: one.rawbody,
            created_at: one.createdAt,
            visible: one.visible
        }))})
    })

    return router
}