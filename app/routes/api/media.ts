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

        const params = {
            Bucket: config.s3Bucket,
            Key: filename,
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

    return router;
  };