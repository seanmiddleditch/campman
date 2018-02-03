import {Request, Response} from 'express'
import {checkAccess} from '../../auth'
import {TagRepository} from '../../models'
import {connection} from '../../db'
import PromiseRouter = require('express-promise-router')

export function tags()
{
    const router = PromiseRouter()
    const tagRepo = connection().getCustomRepository(TagRepository)

    router.get('/tags', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const all = await tagRepo.findForCampaign({campaignId: req.campaign.id})
        if (!all)
            return res.status(404).render('not-found')

        const filtered = all.filter(label => checkAccess('tag:view', {
            profileId: req.profileId,
            role: req.campaignRole
        }))

        res.render('tags', {tags: filtered})
    })

    return router
}