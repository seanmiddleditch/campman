import {Request, Response} from 'express'
import * as passport from 'passport'
import {ProfileModel} from '../../models'
import {URL} from 'url'
import {config} from '../../config'
import PromiseRouter = require('express-promise-router')

export function auth()
{
    const router = PromiseRouter()

    // all auth calls only work on the public URL
    router.use('/auth', (req, res, next) => {
        if (req.hostname != config.publicURL.hostname)
            res.redirect(301, new URL('/auth' + req.path, config.publicURL).toString())
        else
            next()
    })

    router.use('/auth/logout', async (req, res) =>
    {
        if (!req.session)
        {
            res.status(401).json({message: 'Not authenticated'})
        }
        else
        {
            const session = req.session;
            (new Promise(cb => session.destroy(cb))).then(() => res.json({}))
        }
    })

    router.get('/auth/google/callback',
        passport.authenticate('google'),
        (req, res) => {
            const origin = new URL(req.session && req.session.returnURL ? req.session.returnURL : config.publicURL).origin
            if (req.session)
                delete req.session.returnURL
            res.render('google-auth-callback', {origin})
        })

    router.get('/auth/google/login',
        (req, res, next) => {
            if (req.session)
                 req.session.returnURL = req.headers.referer
            next()
        },
        passport.authenticate('google', {prompt: '', scope: ['email', 'profile']}))

    return router
}
