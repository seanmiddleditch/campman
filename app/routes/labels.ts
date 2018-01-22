import {Request, Response} from 'express'
import {checkAccess} from '../auth'
import {LabelRepository} from '../models'
import {connection} from '../db'
import PromiseRouter = require('express-promise-router')

export function labels()
{
    const router = PromiseRouter()
    const labelRepository = connection().getCustomRepository(LabelRepository)

    router.get('/labels', async (req, res) => {
        const labels = await labelRepository.findForLibrary({libraryID: req.libraryID})
        if (!labels)
        {
            res.status(404)
            return res.render('not-found')
        }

        const filtered = labels.filter(label => checkAccess({
            target: 'label:view',
            userID: req.userID,
            role: req.userRole
        }))

        res.render('labels', {labels: filtered})
    })

    return router
}