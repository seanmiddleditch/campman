import {Request, Response, Router} from 'express'
import {Database} from 'squell'
import {LabelController} from '../controllers/label-controller'
import * as helpers from './helpers'

export function labelAPIRoutes(db: Database)
{
    const router = Router()
    const controller = new LabelController(db)

    router.get('/api/labels', helpers.authorized(db), helpers.wrap(async (req) => {
        if (!req.library) return helpers.notFound()

        const librarySlug = req.library.slug
        const result = await controller.listLabels({librarySlug})

        if (!result.labels) return helpers.notFound()
        else return helpers.success(result.labels)
    }))

    router.get('/api/labels/:label', helpers.authorized(db), helpers.wrap(async (req) => {
        if (!req.library) return helpers.notFound()
        
        const labelSlug = req.params.label
        const librarySlug = req.library.slug
        const result = await controller.fetchLabel({labelSlug, librarySlug})

        if (!result.label) return helpers.notFound()
        else return helpers.success({...result.label, notes: result.notes})
    }))

    return router
}