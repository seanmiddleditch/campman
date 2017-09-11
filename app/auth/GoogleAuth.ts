import { Profile, Strategy } from 'passport';
import { OAuth2Strategy } from 'passport-google-oauth';
import { Database } from 'squell';
import UserModel from '../models/UserModel';

export default function GoogleAuth(db: Database, siteURL: string, authConfig: any) : Strategy
{
    return new OAuth2Strategy({
        clientID: authConfig.clientId,
        clientSecret: authConfig.secret,
        callbackURL: siteURL + '/auth/google/callback',
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