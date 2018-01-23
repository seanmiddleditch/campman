import {Profile, Strategy} from 'passport'
import {OAuth2Strategy} from 'passport-google-oauth'
import {ProfileModel, ProfileRepository} from '../models'
import {URL} from 'url'
import {Connection} from 'typeorm'

export function googleAuth(connection: Connection, publicURL: string, googleClientId: string, googleAuthSecret: string) : Strategy
{
    const profileRepository = connection.getCustomRepository(ProfileRepository)

    const callbackURL = new URL(publicURL)
    callbackURL.pathname = '/auth/google/callback'
    return new OAuth2Strategy({
        clientID: googleClientId,
        clientSecret: googleAuthSecret,
        callbackURL: callbackURL.toString(),
        accessType: 'offline',
        approval_prompt: 'force'
    }, (accessToken: string, refreshToken: string, profile: Profile, callback: (err: Error|null, profile: ProfileModel|null) => void) => {
        if (!profile.emails) callback(new Error('Email required'), null)
        else profileRepository.findOrCreateForGoogle({
                googleId: profile.id,
                fullname: profile.displayName,
                email: profile.emails[0].value,
                photoURL: (profile.photos && profile.photos.length && profile.photos[0].value) || ''
            })
            .then(profile => callback(null, profile))
            .catch(err => callback(err, null))
    })
}