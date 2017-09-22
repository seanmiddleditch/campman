import {Request, Response, Router} from 'express';
import * as passport from 'passport';
import {Database} from 'squell';
import User from '../auth/user';
import GoogleAuth from '../auth/google';
import UserModel from '../models/user';
import {wrap, success, accessDenied} from './helpers';

export interface AuthRoutesConfig
{
    publicURL: string,
    googleClientID: string,
    googleAuthSecret: string,
    sessionSecret: string,
    redisURL: string,
}
export default function AuthRoutes(db: Database, config: AuthRoutesConfig)
{
    const router = Router();

    router.post('/auth/logout', wrap(async (req) =>
    {
        if (!req.user) return accessDenied();
        else if (!req.session) return accessDenied();
        const session = req.session;
        return (new Promise(res => session.destroy(res))).then(() => success({}));
    }));

    router.get('/auth/session', wrap(async (req) => {
        if (!req.session) return accessDenied();

        const user = req.user ? req.user as User : null;
        return success({
            googleClientId: config.googleClientID,
            sessionKey: req.session.id,
            user: !user ? null : {
                id: user.id,
                fullName: user.fullName,
                nickname: user.nickname || user.fullName
            }
        });
    }));

    router.get('/auth/google/callback',
        passport.authenticate('google'),
        (req, res) => res.render('auth-callback', {layout: null, publicURL: config.publicURL, sessionKey: req.sessionID, user: req.user}));

    router.get('/auth/google/login',
        passport.authenticate('google', {scope: ['email', 'profile']}),
        (req, res) => res.render('auth-callback', {layout: null, publicURL: config.publicURL, sessionKey: req.sessionID, user: req.user}));

    return router;
}
