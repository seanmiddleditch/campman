import * as aws from 'aws-sdk';
import {S3} from 'aws-sdk';
import {Request, Response, Router} from "express";
import * as express from 'express';
import {Database} from 'squell';
import {wrap, success, accessDenied} from '../helpers';
import {LibraryModel} from '../../models';
import {Access} from '../../auth';
import * as path from 'path';

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
    
    const makeMediaURL = (key: string) => `https://s3-${config.awsRegion}.amazonaws.com/${config.s3Bucket}/${key}`;

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
            url: makeMediaURL(key)
        });
    }));

    router.get('/api/media/list/:pathspec?', wrap(async (req) => {
        const librarySlug = 'default';

        if (!req.user) return accessDenied();
        const access = await LibraryModel.findBySlugACL(db, librarySlug, req.user.id, Access.Visitor);
        if (!access) return accessDenied();
        
        const pathspec = req.params.pathspec ? `${req.params.pathspec}/` : '';

        const key = `library/${librarySlug}/media/${pathspec}`;
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
        
        const folders = (result.CommonPrefixes || []).map(dir => path.basename(dir.Prefix || '/'));
        
        // files need a full URL instead of just a key
        const files = (result.Contents || []).map(file => ({key: file.Key, url: makeMediaURL(file.Key || '')}));

        return success({folders, files});
    }));

    return router;
  };
