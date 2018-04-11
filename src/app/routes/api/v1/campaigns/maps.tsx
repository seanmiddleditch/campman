import PromiseRouter = require('express-promise-router')
import { MapRepository } from '../../../../models'
import { connection } from '../../../../db'

export function maps()
{
    const router = PromiseRouter({mergeParams: true})
    const mapRepository = connection().getCustomRepository(MapRepository)

    router.get('/:id', async (req, res) => {
        const id = req.params['id']
        const one = await mapRepository.findOne({id, campaignId: req.params['campaignId']})

        res.json({status: 'success', body: one ? {
            id: one.id,
            slug: one.slug,
            title: one.title,
            storage: one.storage,
            rawbody: one.rawbody ? JSON.parse(one.rawbody) : null
        } : null})
    })

    router.get('/', async (req, res) => {
        const all = await mapRepository.findByCampaign({campaignId: req.params['campaignId']})

        res.json({status: 'success', body: all.map(one => ({
            id: one.id,
            slug: one.slug,
            title: one.title,
            storage: one.storage,
            rawbody: one.rawbody ? JSON.parse(one.rawbody) : null
        }))})
    })

    return router
}