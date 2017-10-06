import {Request, Response, Router} from 'express'
import {Database} from 'squell'
import {LabelController} from '../../controllers/label-controller'
import {wrapper} from '../helpers'
import {checkAccess} from '../../auth'

export function labelAPIRoutes(db: Database)
{
    const router = Router()
    const controller = new LabelController(db)

    router.get('/api/labels', wrapper(async (req, res) => {
        const result = await controller.listLabels({libraryID: req.libraryID})
        if (!result.labels)
        {
            res.status(404).json({message: 'Labels not found'})
        }
        else
        {
            res.json(result.labels.filter(label => checkAccess({
                target: 'label:view',
                userID: req.userID,
                role: req.userRole
            })))
        }
    }))

    router.get('/api/labels/:label', wrapper(async (req, res) => {
        const labelSlug = req.params.label
        const result = await controller.fetchLabel({labelSlug, libraryID: req.libraryID})
        if (!result.label)
        {
            res.status(404).json({message: 'Label not found'})
        }
        else
        {
            const {label} = result
            res.json({
                slug: label.slug,
                notes: result.notes.length
            })
        }
    }))

    return router
}