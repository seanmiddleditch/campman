import {auth} from './auth'
import {campaigns} from './campaigns'
import PromiseRouter = require('express-promise-router')

export function routes()
{
    const router = PromiseRouter()
    router.use(auth())
    router.use(campaigns())
    router.use('/', (req, res) => res.render('index'))
    return router
}
