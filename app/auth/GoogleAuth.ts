import { Profile, Strategy } from 'passport';
import { OAuth2Strategy } from 'passport-google-oauth';
import { Database } from 'squell';
import UserModel from '../models/UserModel';

export default function GoogleAuth(db: Database, publicURL: string, googleClientId: string, googleAuthSecret: string) : Strategy
{
    return new OAuth2Strategy({
        clientID: googleClientId,
        clientSecret: googleAuthSecret,
        callbackURL: publicURL + '/auth/google/callback',
        accessType: 'offline',
        approval_prompt: 'force'
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