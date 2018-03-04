import {Request, Response} from 'express'
import {checkAccess} from '../../auth'
import {MapRepository} from '../../models'
import {connection} from '../../db'
import PromiseRouter = require('express-promise-router')
import * as multer from 'multer'
import {insertMedia} from '../../util/insert-media'
import {RenderReact} from '../../util/react-ssr'
import {ListMaps} from '../../../common/components/pages/list-maps'
import {NewMap} from '../../../common/components/pages/new-map'
import {ViewMap} from '../../../common/components/pages/view-map'
import * as slugUtils from '../../util/slug-utils'

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

        const canCreate = checkAccess('map:create', {
            profileId: req.profileId,
            role: req.campaignRole
        })

        RenderReact(res, ListMaps, {maps: filtered, canCreate})
    })

    router.get('/new-map', async (req, res, next) =>
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

        if (!checkAccess('map:create', {
            profileId: req.profileId,
            role: req.campaignRole
        }))
        {
            return res.status(403).render('access-denied')
        }

        RenderReact(res, NewMap, {})
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

        RenderReact(res, ViewMap, {map})
    })

    router.post('/maps', multer({limits: {fileSize: 5*1024*1024}}).single('file'), async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess('map:create', {profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).json({status: 'error', message: 'Access denied'})
            return
        }


        const title = req.body['title'] || undefined
        if (typeof title !== 'string' || title.length === 0)
        {
            res.status(400).json({status: 'error', message: 'Please correct the errors', fields: {title: 'Required'}})
            return
        }

        const slug = req.body['slug'] || slugUtils.sanitize(title)
        if (typeof slug !== 'string' || !slugUtils.isValid(slug))
        {
            res.status(400).json({status: 'error', message: 'Please correct the errors', fields: {slug: 'Required'}})
            return
        }

        if (!req.file)
        {
            res.status(400).json({status: 'error', message: 'A file is required', fields: {file: 'Required'}})
            return
        }
        
        const {storageId} = await insertMedia(req.file.buffer)

        const map = mapRepository.create({
            campaignId: req.campaign.id,
            title,
            slug,
            storageId,
            rawbody: ''
        })
        await mapRepository.save(map)

        res.json({status: 'success', message: 'Map created.'})
    })

    return router
}