import {auth} from './auth'
import {campaigns} from './campaigns'
import {join} from './join'
import PromiseRouter = require('express-promise-router')
import {SiteHome} from '../../../components/pages/site-home'
import {NotFound} from '../../../components/pages/not-found'
import { renderMain } from '../../react-ssr'

export function routes()
{
    const router = PromiseRouter()
    router.use(auth())
    router.use(campaigns())
    router.use(join())
    router.use('/', (req, res) => {
        renderMain(req, res, {})
    })
    return router
}
