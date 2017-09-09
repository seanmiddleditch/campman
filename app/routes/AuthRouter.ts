import { Request, Response, Router } from "express";
import * as passport from 'passport';

export default function AuthRouter()
{
    const router = Router();

    router.get('/auth/google/callback', passport.authenticate('google'), (req, res, next) => {
        const redirect = req.session.oauth2return || '/';
        delete req.session.oauth2return;
        res.redirect(redirect);
    });

    router.get('/auth/google/login', (req, res, next) => {
        if (req.query.return) {
            req.session.oauth2return = req.query.return;
        }
        next();
    }, passport.authenticate('google', {scope: ['email', 'profile', 'https://www.googleapis.com/auth/drive.file']}));

    return router;
}