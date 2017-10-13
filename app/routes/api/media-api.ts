import * as aws from 'aws-sdk'
import {S3} from 'aws-sdk'
import {Request, Response, Router} from 'express'
import * as express from 'express'
import {wrapper, ok, fail} from '../helpers'
import {Library, MediaFile, MediaFileRepository} from '../../models'
import {checkAccess} from '../../auth'
import {Connection} from 'typeorm'
import * as path from 'path'
import * as shortid from 'shortid'

export interface MediaRoutesConfig
{
    awsAccessKey: string,
    awsAuthSecret: string,
    s3Bucket: string,
    awsRegion: string,
}
export function mediaAPIRoutes(connection: Connection, config: MediaRoutesConfig)
{
    const router = Router()

    const mediaRepository = connection.getCustomRepository(MediaFileRepository)

    aws.config.region = config.awsRegion
    
    const makeMediaURL = (key: string) => `https://s3-${config.awsRegion}.amazonaws.com/${config.s3Bucket}/${key}`

    const s3 = new aws.S3()
    s3.config.accessKeyId = config.awsAccessKey
    s3.config.secretAccessKey = config.awsAuthSecret

    router.post('/api/media/presign', wrapper(async (req, res) => {
        if (!req.library)
        {
            fail(res, 404, 'Library not found')
        }
        else if (!checkAccess({target: 'media:upload', hidden: false, userID: req.userID, role: req.userRole}))
        {
            fail(res, 403, 'Permission denied')
        }
        else
        {

            const filename = req.body['filename']
            const filetype = req.body['filetype']
            const caption = req.body['caption'] || ''

            let folder = req.body['folder'] || '/'
            if (folder.length === 0 || folder.charAt(0) !== '/')
                folder = '/' + folder
            if (folder.charAt(folder.length - 1) !== '/')
                folder = folder + '/'

            const path = folder + filename

            const librarySlug = req.library.slug
            const uniq = shortid.generate()
            const key = `library/${librarySlug}/media${folder}${uniq}`

            const media = mediaRepository.create({
                path,
                s3key: key,
                caption,
                libraryId: req.libraryID,
                attribution: '',
                labels: []
            })
            await mediaRepository.save(media)

            const params = {
                Bucket: config.s3Bucket,
                Key: key,
                Expires: 60, 
                ContentType: filetype,
                ACL: 'public-read'
            }

            const signed = await new Promise((resolve, reject) => {
                s3.getSignedUrl('putObject', params, (err, data) => {
                    if (err) reject(err)
                    else resolve(data)
                })
            })

            ok(res, {
                signedRequest: signed,
                url: makeMediaURL(key),
                caption,
                path
            })
        }
    }))

    router.get('/api/media/list/:pathspec?', wrapper(async (req, res) => {
        if (!req.library)
        {
            fail(res, 404, 'Library not found')
        }
        else if (!checkAccess({target: 'media:list', hidden: false, userID: req.userID, role: req.userRole}))
        {
            fail(res, 403, 'Permission denied')
        }
        else
        {
            const media = await mediaRepository.findAllByLibrary({libraryID: req.libraryID})

            ok(res, media.map(m => ({path: m.path, url: makeMediaURL(m.s3key), caption: m.caption, attribution: m.attribution})))
        }
    }))

    return router
}
