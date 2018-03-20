import {Request, Response} from 'express'
import * as passport from 'passport'
import {ProfileModel} from '../../models'
import {URL} from 'url'
import {config} from '../../config'
import PromiseRouter = require('express-promise-router')
import { ProfileData } from '../../../types'

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

    router.use('/auth/logout', async (req, res) => {
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
            const profile = req.user as ProfileData
            res.send(`<html><script>try{window.opener.postMessage({name:"login",profile:${JSON.stringify(req.user)}},"*")}catch(e){console.error(e,e.stack)}window.close()</script></html>`)
        }
    )

    router.get('/auth/google/login', passport.authenticate('google', {scope: ['email', 'profile']}))

    return router
}
