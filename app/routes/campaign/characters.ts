import PromiseRouter = require('express-promise-router')
import {Request, Response} from 'express'
import {CharacterRepository, CharacterModel} from '../../models'
import {connection} from '../../db'
import {config} from '../../config'
import {URL} from 'url'
import {checkAccess} from '../../auth'
import {scrubDraftSecrets} from '../../util/scrub-draft-secrets'
import * as slugUtils from '../../util/slug-utils'
import * as multer from 'multer'
import {insertMedia} from '../../util/insert-media'

import {render} from '../../util/react-ssr'
import {ViewCharacter} from '../../../common/components/pages/view-character'
import {ListCharacters}  from '../../../common/components/pages/list-characters'
import {AccessDenied} from '../../../common/components/pages/access-denied'
import {NotFound} from '../../../common/components/pages/not-found'

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

        render(res, ListCharacters, {chars: filtered, editable: canCreate})
    })

    const serveCharacter = (req: Request, res: Response, char: CharacterModel|undefined) => {
        if (!char)
        {
            render(res.status(404), NotFound, {})
            return
        }

        if (!checkAccess('character:view', {profileId: req.profileId, role: req.campaignRole}))
        {
            render(res.status(403), AccessDenied, {})
            return
        }

        const secrets = checkAccess('character:view-secret', {profileId: req.profileId, role: req.campaignRole})

        const editable = checkAccess('character:edit', {profileId: req.profileId, role: req.campaignRole})

        const props = {
            id: char.id,
            char: {...char, rawbody: scrubDraftSecrets(char.rawbody, secrets)},
            editable
        }
        render(res, ViewCharacter, props)
    }

    router.get('/chars/c/:id(\\d+)/', async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const id = req.params['id']
        const char = await characterRepository.fetchById({id, campaignId: req.campaign.id})
        serveCharacter(req, res, char)
    })

    router.get('/chars/c/:slug', async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const slug = req.params['slug']
        const char = await characterRepository.fetchBySlug({slug, campaignId: req.campaign.id})
        serveCharacter(req, res, char)
    })

    router.post('/chars', multer({limits: {fileSize: 1*1024*1024}}).single('portrait'), async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const charId = req.body['id']
        const char = await characterRepository.fetchById({id: charId, campaignId: req.campaign.id})
        if (char)
        {
            if (!checkAccess('character:edit', {profileId: req.profileId, role: req.campaignRole}))
            {
                render(res.status(403), AccessDenied, {})
                return
            }

            const storageId = req.file ? (await insertMedia(req.file.buffer)).storageId : char.portraitStorageId

            const updatedChar = characterRepository.merge(char, {
                title: req.body['title'] || char.title,
                slug: req.body['slug'] || char.slug,
                portraitStorageId: storageId,
                rawbody: req.body['rawbody'] || char.rawbody,
                visible: ('visible' in req.body) ? req.body['visible'] === 'visible' : char.visible
            })
            await characterRepository.save(updatedChar)

            res.json({status: 'success', message: 'Character created.', body: updatedChar})
        }
        else
        {
            if (!checkAccess('character:create', {profileId: req.profileId, role: req.campaignRole}))
            {
                render(res.status(403), AccessDenied, {})
                return
            }

            const storageId = req.file ? (await insertMedia(req.file.buffer)).storageId : null

            const newChar = characterRepository.create({
                campaignId: req.campaign.id,
                title: req.body['title'] || 'Map',
                slug: req.body['slug'] || slugUtils.sanitize(req.body['title']),
                portraitStorageId: storageId,
                rawbody: req.body['rawbody'],
                visible: req.body['visible'] === 'visible'
            })
            await characterRepository.save(newChar)

            res.json({status: 'success', message: 'Character created.'})
        }
    })

    return router
}