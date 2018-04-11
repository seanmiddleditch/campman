import PromiseRouter = require('express-promise-router')
import { PageRepository } from '../../../../models'
import { connection } from '../../../../db'

export function pages()
{
    const router = PromiseRouter({mergeParams: true})
    const pageRepository = connection().getCustomRepository(PageRepository)

    router.get('/:id', async (req, res) => {
        const id = req.params['id']
        const one = await pageRepository.findOne({id, campaignId: req.params['campaignId']})

        res.json({status: 'success', body: one ? {
            id: one.id,
            slug: one.slug,
            title: one.title,
            rawbody: JSON.parse(one.rawbody),
            visiblity: one.visibility
        } : null})
    })

    router.get('/', async (req, res) => {
        const all = await pageRepository.findForCampaign({campaignId: req.params['campaignId']})

        res.json({status: 'success', body: all.map(one => ({
            id: one.id,
            slug: one.slug,
            title: one.title,
            rawbody: JSON.parse(one.rawbody),
            visiblity: one.visibility
        }))})
    })

    return router
}