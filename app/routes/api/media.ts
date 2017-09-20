import * as aws from 'aws-sdk';
import {S3} from 'aws-sdk';
import {Request, Response, Router} from "express";
import * as express from 'express';
import {Database} from 'squell';
import {wrap, success, accessDenied} from '../helpers';
import {LibraryModel} from '../../models';
import {Access} from '../../auth';

export interface MediaRoutesConfig
{
    publicURL: string,
    awsAccessKey: string,
    awsAuthSecret: string,
    s3Bucket: string,
    awsRegion: string,
}
export default function MediaRoutes(db: Database, config: MediaRoutesConfig)
{
    const router = Router();

    aws.config.region = config.awsRegion;

    const s3 = new aws.S3();
    s3.config.accessKeyId = config.awsAccessKey;
    s3.config.secretAccessKey = config.awsAuthSecret;

    router.post('/api/media/presign', wrap(async (req) => {
        const librarySlug = 'default';
        const filename = req.body['filename'];
        const filetype = req.body['filetype'];

        if (!req.user) return accessDenied();
        const access = await LibraryModel.findBySlugACL(db, librarySlug, req.user.id, Access.Visitor);
        if (!access) return accessDenied();

        const key = `library/${librarySlug}/media/${filename}`;

        const params = {
            Bucket: config.s3Bucket,
            Key: key,
            Expires: 60, 
            ContentType: filetype,
            ACL: 'public-read'
        };

        const signed = await new Promise((resolve, reject) => {
            s3.getSignedUrl('putObject', params, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        console.log(signed);

        return success({
            signedRequest: signed,
            putURL: `https://${config.s3Bucket}.s3.amazonnaws.com/${filename}`
        });
    }));

    router.get('/api/media/list/:path?', wrap(async (req) => {
        const librarySlug = 'default';

        if (!req.user) return accessDenied();
        const access = await LibraryModel.findBySlugACL(db, librarySlug, req.user.id, Access.Visitor);
        if (!access) return accessDenied();
        
        const path = req.params.path ? `${req.params.path}/` : '';

        const key = `library/${librarySlug}/media/${path}`;
        console.log(key);
        console.log(JSON.stringify(req.params));

        const params = {
            Delimiter: '/',
            Bucket: config.s3Bucket,
            Prefix: key
        };

        const result = await new Promise<S3.Types.ListObjectsV2Output>((resolve, reject) => {
            s3.listObjectsV2(params, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
        
        // folders will have a trailing / so we need to extract the dirname first
        const folders = result.CommonPrefixes.map(dirname => path.basename(path.dirname(dirname)));
        
        // files need a full URL instead of just a key
        const files = result.Contents.map(file => ({key: file.Key, `https://${config.s3Bucket}.s3.amazonnaws.com/${file.Key}`}));

        return success({folders, files});
    }));

    return router;
  };
