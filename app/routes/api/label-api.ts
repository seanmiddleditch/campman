import {Request, Response, Router} from 'express'
import {wrapper} from '../helpers'
import {checkAccess} from '../../auth'
import {LabelRepository} from '../../models'
import {Connection} from 'typeorm'

export function labelAPIRoutes(connection: Connection)
{
    const router = Router()
    const labelRepository = connection.getCustomRepository(LabelRepository)

    router.get('/api/labels', wrapper(async (req, res) => {
        const labels = await labelRepository.findForLibrary({libraryID: req.libraryID})
        if (!labels)
        {
            res.status(404).json({message: 'Labels not found'})
        }
        else
        {
            res.json(labels.filter(label => checkAccess({
                target: 'label:view',
                userID: req.userID,
                role: req.userRole
            })))
        }
    }))

    router.get('/api/labels/:label', wrapper(async (req, res) => {
        const labelSlug = req.params.label
        const label = await labelRepository.findBySlug({slug: labelSlug, libraryID: req.libraryID})
        if (!label)
        {
            res.status(404).json({message: 'Label not found'})
        }
        else
        {
            res.json({
                slug: label.slug,
                notes: 0 // FIXME
            })
        }
    }))

    return router
}