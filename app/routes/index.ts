import {auth} from './auth'
import {campaigns} from './campaigns'
import {wiki} from './wiki'
import {tags} from './tags'
import {media} from './media'
import PromiseRouter = require('express-promise-router')

export function routes()
{
    const router = PromiseRouter()
    router.use(auth())
    router.use(campaigns())
    router.use(wiki())
    router.use(tags())
    router.use(media())
    router.use('/', async(req, res) => {
        if (req.campaign)
            res.redirect('/w/home')
        else
            res.render('index')
    })
    return router
}
