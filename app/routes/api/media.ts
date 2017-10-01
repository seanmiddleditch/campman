import * as aws from 'aws-sdk'
import {S3} from 'aws-sdk'
import {Request, Response, Router} from "express"
import * as express from 'express'
import {Database} from 'squell'
import {wrap, success, accessDenied, notFound, authorized} from '../helpers'
import {LibraryModel, MediaModel} from '../../models'
import {Access} from '../../auth'
import * as path from 'path'
import * as shortid from 'shortid'

export interface MediaRoutesConfig
{
    awsAccessKey: string,
    awsAuthSecret: string,
    s3Bucket: string,
    awsRegion: string,
}
export default function MediaRoutes(db: Database, config: MediaRoutesConfig)
{
    const router = Router()

    aws.config.region = config.awsRegion
    
    const makeMediaURL = (key: string) => `https://s3-${config.awsRegion}.amazonaws.com/${config.s3Bucket}/${key}`

    const s3 = new aws.S3()
    s3.config.accessKeyId = config.awsAccessKey
    s3.config.secretAccessKey = config.awsAuthSecret

    router.post('/api/media/presign', authorized(db, Access.Player), wrap(async (req) => {
        const filename = req.body['filename']
        const filetype = req.body['filetype']
        const caption = req.body['caption']
        const folder = '/' // req.body['folder'] -- eventually allow user folders FIXME
        
        if (!req.library) return notFound()

        const path = folder + filename

        const librarySlug = req.library.slug
        const uniq = shortid.generate()
        const key = `library/${librarySlug}/media/${folder}${uniq}`

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

        console.log(signed)

        return success({
            signedRequest: signed,
            url: makeMediaURL(key)
        })
    }))

    router.get('/api/media/list/:pathspec?', authorized(db), wrap(async (req) => {
        if (!req.library) return notFound()
        
        const librarySlug = req.library.slug

        const media = await db.query(MediaModel)
            .attributes(m => [m.path, m.s3key, m.caption])
            .include(LibraryModel, q => q.library, m => m.where(m => m.slug.eq(librarySlug)))
            .find()

        console.log(media)
        return success(media.map(m => ({path: m.path, url: makeMediaURL(m.s3key), caption: m.caption, attribution: m.attribution})))
    }))
        

    // old S3-list code
    //     const key = `library/${librarySlug}/media/${pathspec}`

    //     const params = {
    //         Delimiter: '/',
    //         Bucket: config.s3Bucket,
    //         Prefix: key
    //     }

    //     const result = await new Promise<S3.Types.ListObjectsV2Output>((resolve, reject) => {
    //         s3.listObjectsV2(params, (err, data) => {
    //             if (err) reject(err)
    //             else resolve(data)
    //         })
    //     })
        
    //     const folders = result.CommonPrefixes ? result.CommonPrefixes.map(dir => path.basename(dir.Prefix || '/')) : []
        
    //     // files need a full URL instead of just a key
    //     const files = result.Contents ? result.Contents.map(file => ({key: file.Key || '', url: makeMediaURL(file.Key || '')})) : []

    //     files.forEach(f => {
    //         if (f.url.endsWith('/'))
    //         {
    //             console.log('deleting ' + f.key)
    //             s3.deleteObject({
    //                 Bucket: config.s3Bucket,
    //                 Key: f.key
    //             }, (err, data) => {
    //                 if (err) console.error(err)
    //                 else console.log(data)
    //             })
    //         }
    //     })

    //     return success({folders, files})
    // }))

    return router
}
