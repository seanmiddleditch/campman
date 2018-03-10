import {Profile, Strategy} from 'passport'
import * as Google from 'passport-google-oauth2'
import {ProfileModel, ProfileRepository} from '../models'
import {URL} from 'url'
import {Connection} from 'typeorm'

export function googleAuth(connection: Connection, publicURL: string, googleClientId: string, googleAuthSecret: string) : Strategy
{
    const profileRepository = connection.getCustomRepository(ProfileRepository)

    const callbackURL = new URL('/auth/google/callback', publicURL)

    const verify = (accessToken: string, refreshToken: string, profile: Profile, callback: (err: Error|null, profile: ProfileModel|null) => void) => {
        if (!profile.emails) callback(new Error('Email required'), null)
        else profileRepository.findOrCreateForGoogle({
                googleId: profile.id,
                fullname: profile.displayName,
                email: profile.emails[0].value,
                photoURL: (profile.photos && profile.photos.length && profile.photos[0].value) || ''
            })
            .then(profile => callback(null, profile))
            .catch(err => callback(err, null))
    }

    const options: Google.StrategyOptions = {
        clientID: googleClientId,
        clientSecret: googleAuthSecret,
        callbackURL: callbackURL.toString()
    }

    return new Google.Strategy(options, verify)
}