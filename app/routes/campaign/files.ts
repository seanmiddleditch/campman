import {Request, Response} from 'express'
import PromiseRouter = require('express-promise-router')
import * as express from 'express'
import {CampaignModel, MediaModel, MediaFileRepository} from '../../models'
import {checkAccess} from '../../auth'
import {connection} from '../../db'
import * as path from 'path'
import {QueryFailedError} from 'typeorm'
import * as mime from 'mime'
import {URL} from 'url'
import * as multer from 'multer'
import {insertMedia} from '../../util/insert-media'

export function files()
{
    const router = PromiseRouter()

    const mediaRepository = connection().getCustomRepository(MediaFileRepository)

    router.post('/files', multer({limits: {fileSize: 5*1024*1024}}).single('file'), async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')
        
        if (!checkAccess('media:upload', {hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).json({status: 'error', message: 'Access denied.'})
            return
        }

        const file = req.file
        const filePath = req.body['path'] || req.file.filename
        const caption = req.body['caption'] || ''

        if (!file)
        {
            res.status(404).json({status: 'error', message: 'File must be provided.'})
            return
        }

        const cleanPath = path.posix.resolve('/', filePath)
        if (filePath !== cleanPath || filePath.length > 255)
        {
            res.status(400).json({status: 'error', message: 'Path is not legal.'})
            return
        }

        const {storageId, hashHexMD5, contentType} = await insertMedia(file.buffer)
       
        const extension = path.extname(filePath)
        if (mime.getType(extension) !== contentType)
        {
            res.status(400).json({status: 'error', message: 'File extension does not match file type.'})
            return
        }

        // try create a new media entry
        let media = mediaRepository.create({
            path: filePath,
            caption,
            storageId: storageId,
            campaignId: req.campaign.id,
            attribution: ''
        })

        try
        {
            await mediaRepository.save(media)
        }
        catch (error)
        {
            if (error instanceof QueryFailedError)
            {
                res.status(400).json({status: 'error', message: 'File at that path already exists.'})
                return
            }
            else
            {
                throw error
            }
        }

        res.json({
            status: 'success',
            body: {
                path: cleanPath,
                contentMD5: hashHexMD5,
                extension
            }
        })
    })

    router.delete('/files/:pathspec?', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess('media:delete', {hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).json({status: 'error', message: 'Access denied.'})
            return
        }

        const path = '/' + req.params['pathspec'] as string
        const media = await mediaRepository.findByPath({campaignId: req.campaign.id, path})
        if (!media)
        {
            res.status(404).json({status: 'error', message: 'Media not found.'})
            return
        }

        await mediaRepository.delete({id: media.id})

        res.json({status: 'success'})
    })

    router.get('/files/:pathspec?', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess('media:list', {hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).json({status: 'error', message: 'Access denied.'})
            return
        }

        const canUpload = checkAccess('media:upload', {hidden: false, profileId: req.profileId, role: req.campaignRole});
        const canDelete = checkAccess('media:delete', {hidden: false, profileId: req.profileId, role: req.campaignRole});

        const media = await mediaRepository.findByCampaign({campaignId: req.campaign.id})

        if (req.accepts('text/html'))
        {
            res.render('media-browser', {
                media: media.map(m => ({
                    path: m.path,
                    contentMD5: m.contentMD5,
                    extension: m.extension,
                    caption: m.caption,
                    attribution: m.attribution
                })),
                canUpload,
                canDelete
            })
        }
        else if (req.accepts('application/json'))
        {
            res.json({
                status: 'success',
                body: {
                    files: media.map(m => ({
                        path: m.path,
                        contentMD5: m.contentMD5,
                        extension: m.extension,
                        caption: m.caption,
                        attribution: m.attribution
                    }))
                }
            })
        }
        else
        {
            res.status(406).json({status: 'error', message: 'Unknown Accept header value or header not present.'})
        }
    })

    return router
}
