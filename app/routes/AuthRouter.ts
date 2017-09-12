import {Request, Response, Router} from "express";
import * as passport from 'passport';
import * as express from 'express';
import User from '../auth/User';

export default function AuthRouter()
{
    const router = Router();

    router.get('/logout', (req, res) =>
    {
        req.session.destroy(() => res.send('Logged out'));
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