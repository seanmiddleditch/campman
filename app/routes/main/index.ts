import {auth} from './auth'
import {campaigns} from './campaigns'
import {join} from './join'
import PromiseRouter = require('express-promise-router')
import {SiteHome} from '../../../common/components/pages/site-home'
import {NotFound} from '../../../common/components/pages/not-found'
import {render} from '../../util/react-ssr'

export function routes()
{
    const router = PromiseRouter()
    router.use(auth())
    router.use(campaigns())
    router.use(join())
    router.use('/', (req, res) => {
        if (req.url === '/')
            render(res, SiteHome, {})
        else
            render(res, NotFound, {})
    })
    return router
}
