import {S3, AWSError} from 'aws-sdk'
import {MediaStorageModel} from '../models'
import {connection} from '../db'
import {config} from '../config'
import * as imageSize from 'image-size'
import * as fileType from 'file-type'
import * as crypto from 'crypto'
import * as mime from 'mime'

export async function insertMedia(file: Buffer)
{
    const storageRepository = connection().getRepository(MediaStorageModel)

    const hashBuffer = crypto.createHash('md5').update(file).digest()
    const hashHexMD5 = hashBuffer.toString('hex')

    // find existing storage or create it if necessary
    const existing = await storageRepository.createQueryBuilder('storage')
        .select(['id', 'extension'])
        .where('content_md5=:md5', {md5: hashHexMD5})
        .getRawOne()
    if (existing)
    {
        const contentType = mime.getType(existing.extension)
        return {hashHexMD5, contentType, storageId: existing.id}
    }

    const imageInfo = imageSize(file)
    const contentType = fileType(file).mime

    const storage = storageRepository.create({
        contentMD5: hashHexMD5,
        byteLength: file.byteLength,
        extension: imageInfo.type,
        imageWidth: imageInfo.width,
        imageHeight: imageInfo.height,
    })
    await storageRepository.save(storage)
    
    const s3 = new S3()
    s3.config.region = config.awsRegion
    s3.config.accessKeyId = config.awsAccessKey
    s3.config.secretAccessKey = config.awsAuthSecret

    // generate a signed URL for the client to upload the full image
    const putParams: S3.PutObjectRequest = {
        Bucket: config.s3Bucket,
        Key: `media/${hashHexMD5}${imageInfo.type}`,
        ContentType: contentType,
        ContentLength: file.byteLength,
        ContentMD5: hashBuffer.toString('base64'),
        ACL: 'public-read',
        Body: file.buffer
    }
    const result = await new Promise<S3.PutObjectOutput>((resolve, reject) => {
        s3.putObject(putParams, (err, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })

    return {hashHexMD5, contentType, storageId: storage.id}
}