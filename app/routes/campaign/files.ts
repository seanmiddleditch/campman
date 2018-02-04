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

export function files()
{
    const router = PromiseRouter()

    const mediaRepository = connection().getCustomRepository(MediaFileRepository)
    const storageRepository = connection().getRepository(MediaStorageModel)

    const mediaURL = new URL('', config.publicURL)
    mediaURL.hostname = `media.${mediaURL.hostname}`

    const makeMediaURL = (key: string) => new URL(`/img/full/${path.basename(key)}`, mediaURL).toString()
    const makeThumbURL = (key: string, size: number) => new URL(`/img/thumb/${size}/${path.basename(key, path.extname(key))}.png`, mediaURL).toString()

    const s3 = new S3()
    s3.config.region = config.awsRegion
    s3.config.accessKeyId = config.awsAccessKey
    s3.config.secretAccessKey = config.awsAuthSecret

    router.put('/files/:pathspec?', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')
        
        if (!checkAccess('media:upload', {hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).json({status: 'access denied'})
            return
        }

        const filePath = '/' + req.params['pathspec'] as string
        const fileHead = req.body['head'] as string
        const contentMD5 = req.body['contentMD5'] as string
        const contentType = req.body['contentType'] as string
        const contentSize = req.body['contentSize'] as number
        const caption = req.body['caption'] || ''

        const contentHexMD5 = Buffer.from(contentMD5, 'base64').toString('hex')
        const fileHeadBuffer = Buffer.from(fileHead, 'base64')

        if (fileType(fileHeadBuffer).mime !== contentType)
        {
            res.status(400).json({status: 'Incorrect mime type provided for file contents'})
            return
        }
        
        const extension = path.extname(filePath)
        if (mime.getType(extension) !== contentType)
        {
            res.status(400).json({status: 'Incorrect file extension provided'})
            return
        }

        const librarySlug = req.campaign.slug
        const s3key = `media/${contentHexMD5}${extension}`

        const cleanPath = path.posix.resolve('/', filePath)
        if (filePath !== cleanPath || filePath.length > 255)
        {
            res.status(400).json({status: 'invalid path'})
            return
        }

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
                url: makeMediaURL(s3key)
            }
        })
    })

    router.post('/files/:pathspec?', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')
        
        if (!checkAccess('media:upload', {hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).json({status: 'access denied'})
            return
        }

        const contentMD5 = req.body['contentMD5'] as string
        const contentHexMD5 = Buffer.from(contentMD5, 'base64').toString('hex')

        const storage = await storageRepository.findOne({contentMD5: contentHexMD5})
        if (!storage)
        {
            res.status(404).json({status: 'not found'})
            return
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
            // -- can't get this to work; AWSError is always undefined no matter how I try to import
            // if (error.name instanceof AWSError)
            //     return res.json({status: 'Object not available'})
            // else
                throw error
        }
    })

    router.delete('/files/:pathspec?', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess('media:delete', {hidden: false, profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).json({status: 'access denied'})
            return
        }

        const path = '/' + req.params['pathspec'] as string
        const media = await mediaRepository.findByPath({campaignId: req.campaign.id, path})
        if (!media)
        {
            res.status(404).json({status: 'Media not found'})
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
            res.status(403).json({status: 'access denied'})
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
                    url: makeMediaURL(m.s3key),
                    thumb_url: makeThumbURL(m.s3key, 100),
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
                        url: makeMediaURL(m.s3key),
                        thumb_url: makeThumbURL(m.s3key, 100),
                        caption: m.caption,
                        attribution: m.attribution
                    }))
                }
            })
        }
        else
        {
            res.status(406).json({status: 'Unknown Accept header value or header not present'})
        }
    })

    return router
}
