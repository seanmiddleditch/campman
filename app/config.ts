import * as process from 'process'
import {URL} from 'url'

export class Config
{
    readonly publicURL: URL
    readonly googleClientID: string
    readonly googleAuthSecret: string
    readonly sessionSecret: string
    readonly port: number
    readonly redisURL: string
    readonly databaseURL: string
    readonly production: boolean
    readonly webpackDev: boolean
    readonly awsRegion: string
    readonly awsAccessKey: string
    readonly awsAuthSecret: string
    readonly s3Bucket: string
    readonly mailgunKey: string
    readonly mailDomain: string
    readonly inviteAddress: string

    constructor()
    {
        this.publicURL = new URL(process.env.PUBLIC_URL || 'http://localhost:8080')
        this.port = parseInt(process.env.PORT || '8080', 10)
        this.googleClientID = process.env.GOOGLE_CLIENT_ID || ''
        this.googleAuthSecret = process.env.GOOGLE_AUTH_SECRET || ''
        this.sessionSecret = process.env.CM_SESSION_SECRET || ''
        this.webpackDev = process.env.CM_WEBPACK_DEV === 'true'
        this.redisURL = process.env.REDIS_URL || ''
        this.databaseURL = process.env.DATABASE_URL || ''
        this.awsRegion = process.env.AWS_REGION || ''
        this.awsAccessKey = process.env.AWS_ACCESS_KEY || ''
        this.awsAuthSecret = process.env.AWS_SECRET || ''
        this.s3Bucket = process.env.S3_BUCKET || ''
        this.production = process.env.NODE_ENV === 'production'
        this.mailgunKey = process.env.MAILGUN_KEY || ''
        this.mailDomain = process.env.MAIL_DOMAIN || this.publicURL.hostname
        this.inviteAddress = process.env.INVITE_ADDRESS || 'invite-noreply@' + this.mailDomain
    }
}

const config = new Config()
export {config}
