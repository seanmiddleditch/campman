import * as aws from 'aws-sdk'
import {S3} from 'aws-sdk'
import {Request, Response, Router} from 'express'
import * as express from 'express'
import {Database} from 'squell'
import {wrapper} from '../helpers'
import {LibraryModel, MediaModel} from '../../models'
import {checkAccess} from '../../auth'
import * as path from 'path'
import * as shortid from 'shortid'

export interface MediaRoutesConfig
{
    awsAccessKey: string,
    awsAuthSecret: string,
    s3Bucket: string,
    awsRegion: string,
}
export function mediaAPIRoutes(db: Database, config: MediaRoutesConfig)
{
    const router = Router()

    aws.config.region = config.awsRegion
    
    const makeMediaURL = (key: string) => `https://s3-${config.awsRegion}.amazonaws.com/${config.s3Bucket}/${key}`

    const s3 = new aws.S3()
    s3.config.accessKeyId = config.awsAccessKey
    s3.config.secretAccessKey = config.awsAuthSecret

    router.post('/api/media/presign', wrapper(async (req, res) => {
        if (!req.library)
        {
            res.status(404).json({message: 'Library not found'})
        }
        else if (!checkAccess({target: 'media:upload', hidden: false, userID: req.userID, role: req.userRole}))
        {
            res.status(403).json({message: 'Permission denied'})
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

            const newMedia = new MediaModel({
                path,
                s3key: key,
                caption,
                library: await db.query(LibraryModel).where(m => m.slug.eq(librarySlug)).findOne(),
                attribution: '',
                labels: []
            })
            const media = await db.query(MediaModel)
                .include(LibraryModel, m => m.library)
                .create(newMedia, {associate: true})

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

            res.json({
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
            res.status(404).json({message: 'Library not found'})
        }
        else if (!checkAccess({target: 'media:list', hidden: false, userID: req.userID, role: req.userRole}))
        {
            res.status(403).json({message: 'Permission denied'})
        }
        else
        {
            const media = await db.query(MediaModel)
                .attributes(m => [m.path, m.s3key, m.caption])
                .include(LibraryModel, q => q.library, m => m.where(m => m.id.eq(req.libraryID)))
                .find()

            res.json(media.map(m => ({path: m.path, url: makeMediaURL(m.s3key), caption: m.caption, attribution: m.attribution})))
        }
    }))

    return router
}
