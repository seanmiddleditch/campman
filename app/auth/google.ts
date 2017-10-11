import {Profile, Strategy} from 'passport'
import {OAuth2Strategy} from 'passport-google-oauth'
import {Database} from 'squell'
import {UserModel} from '../models'
import {URL} from 'url'
import {User} from './user'

export function googleAuth(db: Database, publicURL: string, googleClientId: string, googleAuthSecret: string) : Strategy
{
    const callbackURL = new URL(publicURL)
    callbackURL.pathname = '/auth/google/callback'
    return new OAuth2Strategy({
        clientID: googleClientId,
        clientSecret: googleAuthSecret,
        callbackURL: callbackURL.toString(),
        accessType: 'offline',
        approval_prompt: 'force'
    }, (accessToken: string, refreshToken: string, profile: Profile, callback: (err: Error|null, profile: User|null) => void) => {
        if (!profile.emails) callback(new Error('Email required'), null)
        else db.query(UserModel)
            .where(m => m.googleId.eq(profile.id))
            .findOrCreate({
                fullName: profile.displayName,
                email: profile.emails[0].value,
                nickname: profile.displayName,
                googleId: profile.id,
                photoURL: (profile.photos && profile.photos.length && profile.photos[0].value) || ''
            })
            .then(([user, created]) => callback(null, user))
            .catch(err => callback(err, null))
    })
}