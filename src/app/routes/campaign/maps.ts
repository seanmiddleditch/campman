import { Request, Response } from 'express'
import { checkAccess } from '../../auth'
import { MapRepository } from '../../models'
import { connection } from '../../db'
import PromiseRouter = require('express-promise-router')
import * as multer from 'multer'
import { insertMedia } from '../../insert-media'
import { render, renderMain } from '../../react-ssr'
import { ListMaps } from '../../../components/pages/list-maps'
import { NewMap } from '../../../components/pages/new-map'
import { ViewMap } from '../../../components/pages/view-map'
import * as slugUtils from '../../../common/slug-utils'
import { AccessDenied } from '../../../components/pages/access-denied'
import { NotFound } from '../../../components/pages/not-found'
import { MapData } from '../../../types'

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
        {
            render(res.status(404), NotFound, {})
            return
        }

        const filtered: MapData[] = all.filter(map => checkAccess('map:view', {
            profileId: req.profileId,
            role: req.campaignRole
        })).map(m => ({
            id: m.id,
            slug: m.slug,
            title: m.title,
            rawbody: m.rawbody ? JSON.parse(m.rawbody) : undefined,
            storage: m.storage,
        }))

        const canCreate = checkAccess('map:create', {
            profileId: req.profileId,
            role: req.campaignRole
        })

        renderMain(req, res, {
            data: {maps: filtered.reduce((coll, map) => ({...coll, [map.id]: map}), {})},
            indices: {maps: filtered.map(map => map.id)}
        })
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
            render(res.status(403), AccessDenied, {})
            return
        }

        render(res, NewMap, {})
    })

    router.get('/maps/m/:slug', async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const slug = req.params['slug']
        const map = await mapRepository.fetchBySlug({slug, campaignId: req.campaign.id})

        if (!map)
        {
            render(res.status(404), NotFound, {})
            return
        }

        if (!checkAccess('map:view', {profileId: req.profileId, role: req.campaignRole}))
        {
            render(res.status(403), AccessDenied, {})
            return
        }

        render(res, ViewMap, {map})
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