import PromiseRouter = require('express-promise-router')
import { MembershipRepository } from '../../../../models'
import { connection } from '../../../../db'

export function members()
{
    const router = PromiseRouter({mergeParams: true})
    const memberRepository = connection().getCustomRepository(MembershipRepository)

    router.get('/', async (req, res) => {
        const members = await memberRepository.findForCampaign({campaignId: req.params['campaignId']})

        res.json({status: 'success', body: members.map(m => ({
            id: m.id,
            nickname: m.nickname,
            fullname: m.fullname,
            photoURL: m.photoURL,
            role: m.role
        }))})
    })

    return router
}