import PromiseRouter = require('express-promise-router')

export function routes()
{
    const router = PromiseRouter()
    router.use((req, res) => res.json({status: 'error', message: 'Unimplemented.'}))
    return router
}