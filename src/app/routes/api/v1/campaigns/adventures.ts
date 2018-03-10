import PromiseRouter = require('express-promise-router')
import { AdventureRepository } from '../../../../models'
import { connection } from '../../../../db'

export function adventures()
{
    const router = PromiseRouter({mergeParams: true})
    const adventureRepository = connection().getCustomRepository(AdventureRepository)

    router.get('/', async (req, res) => {
        const members = await adventureRepository.findForCampaign({campaignId: req.params['campaignId']})

        res.json({status: 'success', body: members.map(m => ({
            id: m.id,
            title: m.title,
            rawbody: m.rawbody,
            created_at: m.createdAt,
            visible: m.visible
        }))})
    })

    return router
}