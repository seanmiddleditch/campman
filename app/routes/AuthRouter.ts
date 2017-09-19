import {Request, Response, Router} from "express";
import * as passport from 'passport';
import * as express from 'express';
import * as session from 'express-session';
import * as redis from 'connect-redis';
import {Database} from 'squell';
import User from '../auth/User';
import GoogleAuth from '../auth/GoogleAuth';
import UserModel from '../models/UserModel';
import {wrap, success, accessDenied} from './helpers';

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
    passport.serializeUser((user: UserModel, done) => done(null, user));
    passport.deserializeUser((user: User, done) => done(null, user));

    const RedisStore = redis(session);
    router.use(session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: new RedisStore({url: config.redisURL})
    }));
    router.use(passport.initialize());
    router.use(passport.session());

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
        passport.authenticate('google', {scope: ['email', 'profile', 'https://www.googleapis.com/auth/drive.file']}),
        (req, res) => res.render('auth-callback', {layout: null, publicURL: config.publicURL, sessionKey: req.sessionID, user: req.user}));

    return router;
}