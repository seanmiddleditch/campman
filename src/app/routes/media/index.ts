import {S3, AWSError} from 'aws-sdk'
import PromiseRouter = require('express-promise-router')
import {config} from '../../config'
import {connection} from '../../db'
import {MediaStorageModel} from '../../models'
import * as sharp from 'sharp'

export function routes()
{
    const router = PromiseRouter()

    const domainSuffix = `.${config.publicURL.host}`

    const mediaRepository = connection().getRepository(MediaStorageModel)

    const s3 = new S3()
    s3.config.region = config.awsRegion
    s3.config.accessKeyId = config.awsAccessKey
    s3.config.secretAccessKey = config.awsAuthSecret

    router.use((req, res, next) =>
    {
        const refererHeaders = req.headers['Referer'] as string|string[]|undefined
        const refererHeader: string|undefined = refererHeaders instanceof Array ? refererHeaders[0] : refererHeaders
        if (refererHeader === undefined || refererHeader.endsWith(domainSuffix))
            next()
        else
            res.status(404).send('External image references are not permitted')
    })
    
    router.get('/img/full/:hash([a-f0-9]+).:ext([a-z]{3,4})', (req, res) =>
    {
        res.redirect(`https://s3-${config.awsRegion}.amazonaws.com/${config.s3Bucket}/media/${req.params.hash}.${req.params.ext}`, 301)
    })
    
    router.get('/img/thumb/:size([0-9]+)/:hash([a-f0-9]+).png', async (req, res) =>
    {
        const size = parseInt(req.params.size, 10)
        const hash = req.params.hash

        // allowed sizes
        if (size != 32 && size != 75 && size != 100 && size != 200 && size != 400)
        {
            res.status(404).send('Unsupported size')
            return
        }

        const thumbKey = `media/thumbs/${size}/${hash}.png`

        const headParams: S3.HeadObjectRequest = {
            Key: thumbKey,
            Bucket: config.s3Bucket
        }
        const exists = await new Promise<boolean>((resolve, reject) =>
        {
            s3.headObject(headParams, (err, data) =>
            {
                if (err && err.code === 'NotFound') resolve(false)
                else if (err) reject(err)
                else resolve(true)
            })
        })
        if (exists)
        {
            res.redirect(`https://s3-${config.awsRegion}.amazonaws.com/${config.s3Bucket}/${thumbKey}`, 301)
            return
        }
        
        const media = await mediaRepository.findOne({
            contentMD5: hash
        })
        if (!media)
        {
            res.status(404).send('Not found')
            return
        }

        console.log(`Generating thumbnail size=${size} for ${media.contentMD5}.${media.extension} at ${thumbKey}`)

        // create the thumbnail
        const s3key = `media/${media.contentMD5}.${media.extension}`
        const getParams: S3.GetObjectRequest = {
            Key: s3key,
            Bucket: config.s3Bucket
        }
        const fullResult = await new Promise<S3.GetObjectOutput>((resolve, reject) => s3.getObject(getParams, (err, data) =>
        {
            if (err) reject(err)
            else resolve(data)
        }))

        const image = fullResult.Body as Buffer

        const thumb = await sharp(image)
            .resize(size)
            .png()
            .toBuffer()

        // save the thumbnail
        const putParams: S3.PutObjectRequest = {
            Key: thumbKey,
            Bucket: config.s3Bucket,
            ContentLength: thumb.length,
            ContentType: 'image/png',
            Body: thumb,
            ACL: 'public-read'
        }
        const putResult = await new Promise<S3.PutObjectOutput>((resolve, reject) => s3.putObject(putParams, (err, data) =>
        {
            if (err) reject(err)
            else resolve(data)
        }))

        res.redirect(`https://s3-${config.awsRegion}.amazonaws.com/${config.s3Bucket}/${thumbKey}`, 301)
    })

    router.get('/', (req, res) => res.status(404).send('Not found'))

    return router
}