import {auth} from './auth'
import {libraries} from './libraries'
import {notes} from './notes'
import {labels} from './labels'
import {media} from './media'
import PromiseRouter = require('express-promise-router')

export function routes()
{
    const router = PromiseRouter()
    router.use(auth())
    router.use(libraries())
    router.use(notes())
    router.use(labels())
    router.use(media())
    router.use('/', async(req, res) => {
        if (req.library)
            res.redirect('/n/home')
        else
            res.render('index')
    })
    return router
}
