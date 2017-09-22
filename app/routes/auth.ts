import {Request, Response, Router} from 'express';
import * as passport from 'passport';
import {Database} from 'squell';
import User from '../auth/user';
import GoogleAuth from '../auth/google';
import UserModel from '../models/user';
import {wrap, success, accessDenied} from './helpers';
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

    const authRouter = Router();
    router.use('/auth', authRouter);

    // all auth calls only work on the public URL
    authRouter.use((req, res, next) => {
        if (req.hostname != config.publicURL.hostname)
            res.redirect(301, new URL('/auth' + req.path, config.publicURL).toString());
        else
            next();
    });

    authRouter.post('/logout', wrap(async (req) =>
    {
        if (!req.user) return accessDenied();
        else if (!req.session) return accessDenied();
        const session = req.session;
        return (new Promise(res => session.destroy(res))).then(() => success({}));
    }));

    authRouter.get('/session', wrap(async (req) => {
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

    authRouter.get('/google/callback',
        passport.authenticate('google'),
        (req, res) => res.render('auth-callback', {layout: null, publicURL: config.publicURL.toString(), sessionKey: req.sessionID, user: req.user}));

    authRouter.get('/google/login',
        passport.authenticate('google', {scope: ['email', 'profile']}),
        (req, res) => res.render('auth-callback', {layout: null, publicURL: config.publicURL.toString(), sessionKey: req.sessionID, user: req.user}));

    return router;
}
