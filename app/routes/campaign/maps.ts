import {Request, Response} from 'express'
import {checkAccess} from '../../auth'
import {MapRepository} from '../../models'
import {connection} from '../../db'
import PromiseRouter = require('express-promise-router')
import * as multer from 'multer'
import {insertMedia} from '../../util/insert-media'

export function maps()
{
    const router = PromiseRouter()
    const mapRepository = connection().getCustomRepository(MapRepository)

    router.get('/maps', async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const all = await mapRepository.findByCampaign({campaignId: req.campaign.id})
        if (!all)
            return res.status(404).render('not-found')

        const filtered = all.filter(map => checkAccess('map:view', {
            profileId: req.profileId,
            role: req.campaignRole
        }))

        const canCreate = checkAccess('map:view', {
            profileId: req.profileId,
            role: req.campaignRole
        })

        res.render('campaign/maps/list', {maps: filtered, canCreate})
    })

    router.get('/maps/m/:slug', async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const slug = req.params['slug']
        const map = await mapRepository.fetchBySlug({slug, campaignId: req.campaign.id})

        if (!map)
        {
            res.status(404).render('not-found')
            return
        }

        if (!checkAccess('map:view', {profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).render('access-denied')
            return
        }

        res.render('campaign/maps/view', {map})
    })

    router.post('/maps', multer({limits: {fileSize: 5*1024*1024}}).single('file'), async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const {storageId} = await insertMedia(req.file.buffer)

        const map = mapRepository.create({
            campaignId: req.campaign.id,
            title: req.body['title'] || 'Map',
            storageId,
            rawbody: ''
        })
        await mapRepository.save(map)

        res.json({status: 'error', message: 'Unsupported.'})
    })

    return router
}