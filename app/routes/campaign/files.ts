import {S3, AWSError} from 'aws-sdk'
import {Request, Response} from 'express'
import PromiseRouter = require('express-promise-router')
import * as express from 'express'
import {CampaignModel, MediaModel, MediaStorageModel, MediaFileRepository} from '../../models'
import {checkAccess} from '../../auth'
import {connection} from '../../db'
import {config} from '../../config'
import * as path from 'path'
import {QueryFailedError} from 'typeorm'
import * as mime from 'mime'
import * as fileType from 'file-type'
import * as imageSize from 'image-size'
import {URL} from 'url'
import * as multer from 'multer'
import * as crypto from 'crypto'

export function files()
{
    const router = PromiseRouter()

    const mediaRepository = connection().getCustomRepository(MediaFileRepository)
    const storageRepository = connection().getRepository(MediaStorageModel)

    const s3 = new S3()
    s3.config.region = config.awsRegion
    s3.config.accessKeyId = config.awsAccessKey
    s3.config.secretAccessKey = config.awsAuthSecret

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

        const hashBuffer = crypto.createHash('md5').update(file.buffer).digest()
        const hashHexMD5 = hashBuffer.toString('hex')
        const hashBase64MD5 = hashBuffer.toString('base64')

        const contentType = fileType(file.buffer).mime
        
        const extension = path.extname(filePath)
        if (mime.getType(extension) !== contentType)
        {
            res.status(400).json({status: 'error', message: 'File extension does not match file type.'})
            return
        }

        const imageInfo = imageSize(file.buffer)

        // find existing storage or create it if necessary
        let storage = await storageRepository.createQueryBuilder('storage')
            .select(['id'])
            .where('content_md5=:md5', {md5: hashHexMD5})
            .printSql()
            .getRawOne()
        if (!storage)
        {
            storage = storageRepository.create({
                contentMD5: hashHexMD5,
                extension,
                byteLength: file.size,
                imageWidth: imageInfo.width,
                imageHeight: imageInfo.height,
            })
            storage = await storageRepository.save(storage)
        }

        // try create a new media entry
        let media = mediaRepository.create({
            path: filePath,
            caption,
            storageId: storage.id,
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

        // generate a signed URL for the client to upload the full image
        const putParams: S3.PutObjectRequest = {
            Bucket: config.s3Bucket,
            Key: `media/${hashHexMD5}${extension}`,
            ContentType: contentType,
            ContentLength: file.size,
            ContentMD5: hashBase64MD5,
            ACL: 'public-read',
            Body: file.buffer
        }
        try
        {
            const result = await new Promise<S3.PutObjectOutput>((resolve, reject) => {
                s3.putObject(putParams, (err, data) => {
                    if (err) reject(err)
                    else resolve(data)
                })
            })
        }
        catch (error)
        {
            mediaRepository.delete(media)
            throw error
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
