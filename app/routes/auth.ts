import {Request, Response, Router} from 'express';
import * as passport from 'passport';
import {Database} from 'squell';
import User from '../auth/user';
import GoogleAuth from '../auth/google';
import UserModel from '../models/user';
import {wrap, success, accessDenied, authenticated} from './helpers';
import {URL} from 'url';

export interface AuthRoutesConfig
{
    publicURL: URL,
    googleClientID: string,
    googleAuthSecret: string,
    sessionSecret: string,
    redisURL: string,
}
export default function AuthRoutes(db: Database, config: AuthRoutesConfig)
{
    const router = Router();

    // all auth calls only work on the public URL
    router.use('/auth', (req, res, next) => {
        if (req.hostname != config.publicURL.hostname)
            res.redirect(301, new URL('/auth' + req.path, config.publicURL).toString());
        else
            next();
    });

    router.post('/auth/logout', authenticated, wrap(async (req) =>
    {
        if (!req.session) return accessDenied();
        const session = req.session;
        return (new Promise(res => session.destroy(res))).then(() => success({}));
    }));

    router.get('/auth/session', authenticated, wrap(async (req) => {
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
        (req, res) => {
            const returnURL = req.session && req.session.returnURL ? req.session.returnURL : config.publicURL;
            if (req.session)
                delete req.session.returnURL;
            res.render('auth-callback', {layout: null, returnURL, sessionKey: req.sessionID, user: req.user});
        });

    router.get('/auth/google/login',
        (req, res, next) => {
            if (req.session)
                 req.session.returnURL = req.headers.referer;
            next();
        },
        passport.authenticate('google', {scope: ['email', 'profile']}));

    return router;
}
