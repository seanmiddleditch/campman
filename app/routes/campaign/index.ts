import {Request, Response, NextFunction} from 'express'
import {wiki} from './wiki'
import {tags} from './tags'
import {media} from './media'
import {CampaignModel, CampaignRepository, MembershipRepository,} from '../../models'
import {CampaignRole} from '../../auth'
import PromiseRouter = require('express-promise-router')
import {connection} from '../../db'

function resolveCampaign()
{
    const campaignRepository = connection().getCustomRepository(CampaignRepository)
    const domainCache = new Map<string, CampaignModel | null>()
    return async (req: Request, res: Response, next: NextFunction) =>
    {
        // determine which subdomain-slug we're using, if any
        const campaign = domainCache.get(req.hostname)
        const slug = req.subdomains.length ? req.subdomains[req.subdomains.length - 1] : null

        if (campaign)
        {
            req.campaign = campaign
            res.locals.campaign = campaign
            return next()
        }
        else if (slug)
        {
            req.campaign = await campaignRepository.findBySlug({slug})
            if (req.campaign)
            {
                domainCache.set(req.hostname, req.campaign || null)
                req.campaign.id = req.campaign ? req.campaign.id : 0
                res.locals.campaign = req.campaign
    
                return next()
            }
        }

        res.status(404).render('not-found')
    }
}

function lookupProfileRolse()
{
    const membershipRepository = connection().getCustomRepository(MembershipRepository)
    return async (req: Request, res: Response, next: NextFunction) =>
    {
        if (req.campaign && req.user && req.session)
        {
            const key = `campaign[${req.campaign.id}].role`
            if (!(key in req.session))
            {
                const role = await await membershipRepository.findRoleForProfile({profileId: req.profileId, campaignId: req.campaign.id})
                req.session[key] = role
            }

            req.campaignRole = res.locals.role = req.session[key]
        }
        else
        {
            req.campaignRole = res.locals.role = CampaignRole.Visitor
        }

        next()
    }
}

export function routes()
{
    const router = PromiseRouter()
    router.use(resolveCampaign())
    router.use(wiki())
    router.use(tags())
    router.use(media())
    router.use('/', (req, res) => res.redirect('/w/home'))
    return router
}