import PromiseRouter = require('express-promise-router')
import {CharacterRepository} from '../../models'
import {connection} from '../../db'
import {config} from '../../config'
import {URL} from 'url'
import {checkAccess} from '../../auth'
import {draftToHtml} from '../../util/draft-to-html'
import * as slugUtils from '../../util/slug-utils'
import * as multer from 'multer'
import {insertMedia} from '../../util/insert-media'

export function characters() {
    const router = PromiseRouter()
    const characterRepository = connection().getCustomRepository(CharacterRepository)

    router.get('/chars', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const all = await characterRepository.findForCampaign({campaignId: req.campaign.id})
        const filtered = all.filter(char => checkAccess('character:view', {
            profileId: req.profileId,
            role: req.campaignRole,
            hidden: !char.visible
        }))

        const canCreate = checkAccess('character:view', {profileId: req.profileId, role: req.campaignRole})

        res.render('campaign/characters/list', {
            characters: filtered,
            canCreate
        })
    })

    router.get('/chars/c/:slug', async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const slug = req.params['slug']
        const char = await characterRepository.fetchBySlug({slug, campaignId: req.campaign.id})

        if (!char)
        {
            res.status(404).render('not-found')
            return
        }

        if (!checkAccess('character:view', {profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).render('access-denied')
            return
        }

        const editable = checkAccess('character:edit', {profileId: req.profileId, role: req.campaignRole})

        res.render('campaign/characters/view', {char: {...char, editable}})
    })

    router.post('/chars', multer({limits: {fileSize: 1*1024*1024}}).single('portrait'), async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess('character:create', {profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403).render('access-denied')
            return
        }

        const storageId = req.file ? (await insertMedia(req.file.buffer)).storageId : null

        const char = characterRepository.create({
            campaignId: req.campaign.id,
            title: req.body['title'] || 'Map',
            portraitStorageId: storageId,
            rawbody: req.body['rawbody']
        })
        await characterRepository.save(char)

        res.json({status: 'success', message: 'Character created.'})
    })

    return router
}