import PromiseRouter = require('express-promise-router')
import {LibraryModel, LibraryRepository} from '../models/library-model'
import {connection} from '../db'
import {config} from '../config'
import {URL} from 'url'

export function libraries() {
    const router = PromiseRouter()
    const libraries = connection().getCustomRepository(LibraryRepository)

    router.get('/libraries', async (req, res, next) => {
        if (req.library)
            return next()

        const all = await libraries.findAllForUser({userID: req.userID})

        res.render('libraries', {libraries: all.map(lib => ({
            ...lib,
            publicURL: (new URL(`${config.publicURL.protocol}//${lib.slug}.${config.publicURL.hostname}:${config.publicURL.port}`).toString())
        }))})
    })
    return router
}