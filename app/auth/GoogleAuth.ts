import { Profile, Strategy } from 'passport';
import { OAuth2Strategy } from 'passport-google-oauth';
import { Database } from 'squell';
import UserModel from '../models/UserModel';

export default function GoogleAuth(db: Database, config: any) : Strategy
{
    return new OAuth2Strategy({
        clientID: config.auth.google.clientId,
        clientSecret: config.auth.google.secret,
        callbackURL: config.auth.google.callbackURL,
        accessType: 'offline'
    }, (accessToken: string, refreshToken: string, profile: Profile, callback: (err: Error, profile: any) => void) => {
        db.query(UserModel)
            .where(m => m.googleId.eq(profile.id))
            .findOrCreate({
                fullName: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id
            })
            .then(([user, created]) => callback(null, user))
            .catch(err => callback(err, null));
    });
}