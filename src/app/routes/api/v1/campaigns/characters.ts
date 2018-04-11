import PromiseRouter = require('express-promise-router')
import { CharacterRepository } from '../../../../models'
import { connection } from '../../../../db'

export function characters()
{
    const router = PromiseRouter({mergeParams: true})
    const characterRepository = connection().getCustomRepository(CharacterRepository)

    router.get('/:id', async (req, res) => {
        const id = req.params['id']
        const one = await characterRepository.findOne({id, campaignId: req.params['campaignId']})

        res.json({status: 'success', body: one ? {
            id: one.id,
            title: one.title,
            rawbody: JSON.parse(one.rawbody),
            owner: one.ownerId,
            portrait: one.portrait,
            visible: one.visible
        } : null})
    })

    router.get('/', async (req, res) => {
        const all = await characterRepository.findForCampaign({campaignId: req.params['campaignId']})

        res.json({status: 'success', body: all.map(one => ({
            id: one.id,
            title: one.title,
            rawbody: JSON.parse(one.rawbody),
            owner: one.ownerId,
            portrait: one.portrait,
            visible: one.visible
        }))})
    })

    return router
}