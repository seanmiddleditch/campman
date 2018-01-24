import {Request, Response, NextFunction} from 'express'
import {wiki} from './wiki'
import {tags} from './tags'
import {media} from './media'
import {CampaignModel, CampaignRepository} from '../../models'
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