import PromiseRouter = require('express-promise-router')
import { MediaFileRepository } from '../../../../models'
import { connection } from '../../../../db'

export function files()
{
    const router = PromiseRouter({mergeParams: true})
    const fileRepository = connection().getCustomRepository(MediaFileRepository)

    router.get('/', async (req, res) => {
        const members = await fileRepository.findByCampaign({campaignId: req.params['campaignId']})

        res.json({status: 'success', body: members.map(f => ({
            id: f.id,
            path: f.path,
            caption: f.caption,
            attribution: f.attribution,
            contentMD5: f.contentMD5,
            extension: f.extension
        }))})
    })

    return router
}