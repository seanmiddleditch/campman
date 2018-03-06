import PromiseRouter = require('express-promise-router')
import { campaigns } from './campaigns'

export function routes()
{
    const router = PromiseRouter()
    router.use('/campaigns', campaigns())
    return router
}