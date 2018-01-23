import {S3, AWSError} from 'aws-sdk'
import {Request, Response} from 'express'
import PromiseRouter = require('express-promise-router')
import * as express from 'express'
import {CampaignModel, MediaModel, MediaStorageModel, MediaFileRepository} from '../models'
import {checkAccess} from '../auth'
import {connection} from '../db'
import {config} from '../config'
import * as path from 'path'
import {QueryFailedError} from 'typeorm'
import * as mime from 'mime'
import * as fileType from 'file-type'
import * as imageSize from 'image-size'

export function media()
{
    const router = PromiseRouter()

    const mediaRepository = connection().getCustomRepository(MediaFileRepository)
    const storageRepository = connection().getRepository(MediaStorageModel)

    const makeMediaURL = (key: string) => `https://s3-${config.awsRegion}.amazonaws.com/${config.s3Bucket}/${key}`

    const s3 = new S3()
    s3.config.region = config.awsRegion
    s3.config.accessKeyId = config.awsAccessKey
    s3.config.secretAccessKey = config.awsAuthSecret

    router.put('/media/:pathspec?', async (req, res, next) => {
        if (!req.campaign)
        {
            return next()
        }
        
        if (!checkAccess({target: 'media:upload', hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403)
            return res.json({status: 'access denied'})
        }

        const filePath = '/' + req.params['pathspec'] as string
        const fileHead = req.body['head'] as string
        const contentMD5 = req.body['contentMD5'] as string
        const contentType = req.body['contentType'] as string
        const contentSize = req.body['contentSize'] as number
        const caption = req.body['caption'] || ''
        const thumbnailBase64 = req.body['thumbnailBase64']

        const contentHexMD5 = Buffer.from(contentMD5, 'base64').toString('hex')
        const fileHeadBuffer = Buffer.from(fileHead, 'base64')
        const thumbnailBuffer = Buffer.from(thumbnailBase64, 'base64')

        const thumbnailMaxDimension = 200
        const thumbnailMaxSize = 64 * 1024 // 64k
        const thumbnailDimensions = imageSize(thumbnailBuffer)
        if (thumbnailDimensions.type != 'png')
            return res.json({status: 'Thumbnail must be a PNG'})
        else if (thumbnailDimensions.width > thumbnailMaxDimension)
            return res.json({status: 'Thumbnail must be no larger than 200x200'})
        else if (thumbnailDimensions.height > thumbnailMaxDimension)
            return res.json({status: 'Thumbnail must be no larger than 200x200'})
        else if (thumbnailBuffer.byteLength > thumbnailMaxSize)
            return res.json({status: 'Thumbnail must be no larger than 64kb'})

        if (fileType(fileHeadBuffer).mime !== contentType)
            return res.json({status: 'Incorrect mime type provided for file contents'})
        
        const extension = path.extname(filePath)
        if (mime.getType(extension) !== contentType)
            return res.json({status: 'Incorrect file extension provided'})

        const librarySlug = req.campaign.slug
        const s3key = `media/${contentHexMD5}${extension}`
        const thumbS3key = `media/thumbs/${contentHexMD5}.png`

        const cleanPath = path.posix.resolve('/', filePath)
        if (filePath !== cleanPath || filePath.length > 255)
            return res.json({status: 'invalid path'})

        // find existing storage or create it if necessary
        let storage = await storageRepository.createQueryBuilder('storage')
            .select(['id', 's3key', 'thumb_s3key', 'state'])
            .where('content_md5=:md5', {md5: contentHexMD5})
            .printSql()
            .getRawOne()
        if (!storage)
        {
            storage = storageRepository.create({
                s3key: s3key,
                thumbS3key,
                contentMD5: contentHexMD5,
                state: 'Pending'
            })
            storage = await storageRepository.save(storage)
        }

        const pathComponents = path.parse(filePath)
        let pathAttempt = 1

        // try create a new media entry
        let media = mediaRepository.create({
            path: filePath,
            caption,
            storageId: storage.id,
            campaignId: req.campaign.id,
            attribution: ''
        })

        for (;;)
        {
            try
            {
                await mediaRepository.save(media)
                break
            }
            catch (error)
            {
                if (error instanceof QueryFailedError)
                {
                    ++pathAttempt
                    media.path = path.format({...pathComponents, base: `${pathComponents.name} (${pathAttempt})${pathComponents.ext}`})
                }
                else
                {
                    throw error
                }
            }
        }

        // if storage isn't yet initialized, start that process now
        let signed_put_url: string|undefined
        if (storage.state === 'Pending')
        {
            // store the thumbnail immediately, since we already have it
            const putThumbParams: S3.PutObjectRequest = {
                Bucket: config.s3Bucket,
                Key: thumbS3key,
                ContentType: 'image/png',
                ContentLength: thumbnailBuffer.byteLength,
                ACL: 'public-read',
                Body: thumbnailBuffer
            }
            await new Promise<S3.PutObjectOutput>((resolve, reject) => {
                s3.putObject(putThumbParams, (err, data) => {
                    if (err) reject(err)
                    else resolve(data)
                })
            })

            // generate a signed URL for the client to upload the full image
            const putParams: S3.PutObjectRequest = {
                Bucket: config.s3Bucket,
                Key: s3key,
                Expires: 60 * 5 /* 5 minutes */ as any, // the SDK wants a Date, but that always results in a bad signed URL
                ContentType: contentType,
                //ContentLength: contentSize, // not supported by presigned URLs, for some reason
                ContentMD5: contentMD5,
                ACL: 'public-read'
            }
            signed_put_url = await new Promise<string>((resolve, reject) => {
                s3.getSignedUrl('putObject', putParams, (err, data) => {
                    if (err) reject(err)
                    else resolve(data)
                })
            })
        }

        res.json({
            status: 'success',
            body: {
                path: cleanPath,
                signed_put_url,
                url: makeMediaURL(s3key),
                thumb_url: makeMediaURL(thumbS3key)
            }
        })
    })

    router.post('/media/:pathspec?', async (req, res, next) => {
        if (!req.campaign)
        {
            return next()
        }
        
        if (!checkAccess({target: 'media:upload', hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403)
            return res.json({status: 'access denied'})
        }

        const contentMD5 = req.body['contentMD5'] as string
        const contentHexMD5 = Buffer.from(contentMD5, 'base64').toString('hex')

        const storage = await storageRepository.findOne({contentMD5: contentHexMD5})
        if (!storage)
        {
            res.status(404)
            return res.json({status: 'not found'})
        }

        const headParams: S3.HeadObjectRequest = {
            Bucket: config.s3Bucket,
            Key: storage.s3key
        }

        try
        {
            const result = await new Promise<S3.HeadObjectOutput>((resolve, reject) => {
                s3.headObject(headParams, (err, data) => {
                    if (err) reject(err)
                    else resolve(data)
                })
            })

            storage.state = 'Ready'
            await storageRepository.save(storage)

            res.json({status: 'success'})
        }
        catch (error)
        {
            if (error.name instanceof AWSError)
                return res.json({status: 'Object not available'})
            else
                throw error
        }
    })

    router.delete('/media/:pathspec?', async (req, res, next) => {
        if (!req.campaign)
        {
            return next()
        }

        if (!checkAccess({target: 'media:delete', hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403)
            return res.json({status: 'access denied'})
        }

        const path = '/' + req.params['pathspec'] as string
        const media = await mediaRepository.findByPath({campaignId: req.campaign.id, path})
        if (!media)
        {
            res.status(404)
            return res.json({status: 'Media not found'})
        }

        await mediaRepository.delete({id: media.id})

        res.json({status: 'success'})
    })

    router.get('/media/:pathspec?', async (req, res, next) => {
        if (!req.campaign)
        {
            return next()
        }

        if (!checkAccess({target: 'media:list', hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403)
            return res.json({status: 'access denied'})
        }

        const canUpload = checkAccess({target: 'media:upload', hidden: false, profileId: req.profileId, role: req.campaignRole});

        const media = await mediaRepository.findByCampaign({campaignId: req.campaign.id})

        if (req.accepts('text/html'))
        {
            res.render('media-browser', {
                media: media.map(m => ({
                    path: m.path,
                    url: makeMediaURL(m.s3key),
                    thumb_url: makeMediaURL(m.thumb_s3key),
                    caption: m.caption,
                    attribution: m.attribution
                })),
                canUpload
            })
        }
        else if (req.accepts('application/json'))
        {
            res.json({
                status: 'success',
                body: {
                    files: media.map(m => ({
                        path: m.path,
                        url: makeMediaURL(m.s3key),
                        thumb_url: makeMediaURL(m.thumb_s3key),
                        caption: m.caption,
                        attribution: m.attribution
                    }))
                }
            })
        }
        else
        {
            res.status(406)
            res.json({status: 'Unknown Accept header value or header not present'})
        }
    })

    return router
}
