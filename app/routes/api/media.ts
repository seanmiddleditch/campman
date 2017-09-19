import * as aws from 'aws-sdk';
import {S3} from 'aws-sdk';
import {Request, Response, Router} from "express";
import * as express from 'express';
import {wrap, success} from '../helpers';

export interface MediaRoutesConfig
{
    publicURL: string,
    awsAccessKey: string,
    awsAuthSecret: string,
    s3Bucket: string
}
export default function MediaRoutes(config: MediaRoutesConfig)
{
    const router = Router();

    router.post('/api/media/upload', wrap(async (req) => {
        const s3 = new aws.S3();

        const filename = req.params['filename'];
        const filetype = req.params['filetype'];

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