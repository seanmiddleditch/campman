import {Request, Response, Router} from "express";
import * as passport from 'passport';
import * as express from 'express';
import * as session from 'express-session';
import * as redis from 'connect-redis';
import {Database} from 'squell';
import User from '../auth/User';
import GoogleAuth from '../auth/GoogleAuth';
import UserModel from '../models/UserModel';

export interface AuthRouterConfig
{
    publicURL: string,
    googleClientID: string,
    googleAuthSecret: string,
    sessionSecret: string,
    redisURL: string,
}
export default function AuthRouter(db: Database, config: AuthRouterConfig)
{
    const router = Router();

    passport.use(GoogleAuth(db, config.publicURL, config.googleClientID, config.googleAuthSecret));
    passport.serializeUser((user: UserModel, done) => done(null, user.id));
    passport.deserializeUser((userID: number, done) => db.query(UserModel).where(m => m.id.eq(userID)).findOne().then(user => done(null, user)).catch(err => done(err)));

    const RedisStore = redis(session);
    router.use(session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: config.redisURL ? new RedisStore({url: config.redisURL}) : null
    }));
    router.use(passport.initialize());
    router.use(passport.session());

    router.get('/auth/logout', (req, res) =>
    {
        req.session.destroy(() => res.json({}));
    });

    router.get('/auth/session.js', (req, res) => {
        const user = req.user ? req.user as User : null;
        res.json({
            googleClientId: config.googleClientID,
            sessionKey: req.sessionID,
            user: !req.user ? null : {
                id: user.id,
                fullName: user.fullName,
                nickname: user.nickname || user.fullName
            }
        });
    });

    const authCallback = (req: express.Request, res: express.Response) =>
        {
            const user = req.user as User;
            const sessionKey = req.sessionID;
            res.send('<script>try{window.opener.onLogin({sessionKey:"'+encodeURIComponent(sessionKey)+'"});}catch(e){} window.close();</script>');
        };

    router.get('/auth/google/callback',
        passport.authenticate('google'),
        authCallback);

    router.get('/auth/google/login',
        passport.authenticate('google', {scope: ['email', 'profile', 'https://www.googleapis.com/auth/drive.file']}),
        authCallback);

    return router;
}