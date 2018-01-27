import {auth} from './auth'
import {campaigns} from './campaigns'
import PromiseRouter = require('express-promise-router')

export function routes()
{
    const router = PromiseRouter()
    router.use(auth())
    router.use(campaigns())
    router.use('/', (req, res) => {
        if (req.url === '/')
            res.render('index')
        else
            res.render('not-found')
    })
    return router
}
