import PromiseRouter = require('express-promise-router')
import {checkAccess, CampaignRole} from '../../auth'
import {MembershipRepository} from '../../models/membership-model'
import {connection} from '../../db'
import {config} from '../../config'
import {URL} from 'url'
import {QueryFailedError} from 'typeorm'

export function membership() {
    const router = PromiseRouter()
    const membershipRepository = connection().getCustomRepository(MembershipRepository)

    router.get('/membership', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess({target: 'campaign:configure', hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).json({status: 'access denied'})
            return
        }

        const all = await membershipRepository.findForCampaign({campaignId: req.campaign.id})

        res.render('campaign/membership', {members: all})
    })

    router.post('/membership/:profileId', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess({target: 'campaign:configure', hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).json({status: 'access denied'})
            return
        }

        const profileId = req.body['profileId']
        const newRole = req.body['role']

        const oldRole = await membershipRepository.findRoleForProfile({profileId, campaignId: req.campaign.id})
        if (oldRole === CampaignRole.Owner)
        {
            res.status(400).json({status: 'failed', message: 'Cannot delete the owner from a campaign.'})
            return;
        }
        else if (oldRole === CampaignRole.Visitor)
        {
            res.status(400).json({status: 'failed', message: 'Cannot change the role of non-members.'})
            return
        }

        await membershipRepository.update(
            {
                campaignId: req.campaign.id,
                profileId: req.body['profileId']
            },
            {
                role: newRole
            }
        )

        res.json({status: 'success', message: 'Role updated.'})
    })

    router.delete('/membership/:profileId', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess({target: 'campaign:configure', hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).json({status: 'access denied'})
            return
        }

        const profileId = req.body['profileId']
        const role = await membershipRepository.findRoleForProfile({profileId, campaignId: req.campaign.id})
        if (role === CampaignRole.Owner)
        {
            res.status(400).json({status: 'failed', message: 'Cannot delete the owner from a campaign.'})
            return;
        }

        await membershipRepository.delete({
            campaignId: req.campaign.id,
            profileId: req.body['profileId']
        })

        res.json({status: 'success', message: 'Membership removed.'})
    })

    return router
}