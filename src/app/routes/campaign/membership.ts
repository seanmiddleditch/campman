import PromiseRouter = require('express-promise-router')
import {checkAccess, CampaignRole} from '../../auth'
import {MembershipRepository} from '../../models/membership-model'
import {InvitationRepository} from '../../models/invitation-model'
import {connection} from '../../db'
import {config} from '../../config'
import {URL} from 'url'
import {QueryFailedError} from 'typeorm'
import * as shortid from 'shortid'
import * as mailgun from 'mailgun-js'
import {CampaignMembership} from '../../../components/pages/campaign-membership'
import {AccessDenied} from '../../../components/pages/access-denied'
import {render} from '../../util/react-ssr'

export function membership() {
    const router = PromiseRouter()
    const membershipRepository = connection().getCustomRepository(MembershipRepository)
    const invitationRepository = connection().getCustomRepository(InvitationRepository)
    const messages = mailgun({apiKey: config.mailgunKey, domain: config.mailDomain}).messages()

    router.get('/membership', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess('campaign:configure', {hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            render(res.status(403), AccessDenied, {})
            return
        }

        const all = (await membershipRepository.findForCampaign({campaignId: req.campaign.id})).map(m => ({
            fullname: m.fullname,
            nickname: m.nickname,
            photoURL: m.photoURL,
            email: m.email,
            role: m.role,
            id: m.id
        }))

        render(res, CampaignMembership, {members: all})
    })

    router.post('/membership', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const email = req.body['email'] as string|undefined
        
        if (!email)
        {
            res.status(400).json({status: 'error', message: 'Invalid email address.'})
            return
        }

        const code = shortid()
        
        const invite = await invitationRepository.createInvitation({code, email, campaignId: req.campaign.id})

        const title = req.campaign.title
        const inviter = req.user.nickname || req.user.fullname
        const url = new URL(`/join/${code}`, config.publicURL).toString()
        try
        {
            const result = true
            await new Promise<string>((resolve, reject) => {
                messages.send({
                    from: config.inviteAddress,
                    to: email,
                    subject: `Invitation to ${title}`,
                    text: `You have been invited to ${title} by ${inviter}. Go to ${url} to join! If this message appears to be in error, please ignore it.`
                }, (err, body) => {
                    if (err) reject(err)
                    else resolve(body)
                })
            })
            res.json({status: 'success', data: {code}})
        }
        catch (err)
        {
            console.error(err)
            res.status(500).json({status: 'error', message: 'Could not send email.'})
        }
    })

    router.post('/membership/:profileId', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess('campaign:configure', {hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).json({status: 'error', message: 'Access denied.'})
            return
        }

        const profileId = req.body['profileId']
        const newRole = req.body['role']

        const oldRole = await membershipRepository.findRoleForProfile({profileId, campaignId: req.campaign.id})
        if (oldRole === CampaignRole.Owner)
        {
            res.status(400).json({status: 'error', message: 'Cannot delete the owner from a campaign.'})
            return;
        }
        else if (oldRole === CampaignRole.Visitor)
        {
            res.status(400).json({status: 'error', message: 'Cannot change the role of non-members.'})
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

        if (!checkAccess('campaign:configure', {hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).json({status: 'access denied'})
            return
        }

        const profileId = req.body['profileId']
        const role = await membershipRepository.findRoleForProfile({profileId, campaignId: req.campaign.id})
        if (role === CampaignRole.Owner)
        {
            res.status(400).json({status: 'error', message: 'Cannot delete the owner from a campaign.'})
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