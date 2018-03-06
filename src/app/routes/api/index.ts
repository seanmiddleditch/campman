import PromiseRouter = require('express-promise-router')
import {routes as v1routes} from './v1'

export function routes()
{
    const router = PromiseRouter()
    router.use('/api/v1', v1routes())
    return router
}