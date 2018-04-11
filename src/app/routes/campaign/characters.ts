import PromiseRouter = require('express-promise-router')
import { Request, Response } from 'express'
import { CharacterRepository, CharacterModel } from '../../models'
import { connection } from '../../db'
import { config } from '../../config'
import { URL } from 'url'
import { checkAccess } from '../../auth'
import { scrubDraftSecrets } from '../../../common/draft-utils'
import * as slugUtils from '../../../common/slug-utils'
import * as multer from 'multer'
import { insertMedia } from '../../insert-media'
import { CharacterData } from '../../../types'
import { render, renderMain } from '../../react-ssr'
import { ViewCharacter } from '../../../components/pages/view-character'
import { EditCharacter } from '../../../components/pages/edit-character'
import { NewCharacter } from '../../../components/pages/new-character'
import { ListCharacters } from '../../../components/pages/list-characters'
import { AccessDenied } from '../../../components/pages/access-denied'
import { NotFound } from '../../../components/pages/not-found'

export function characters() {
    const router = PromiseRouter()
    const characterRepository = connection().getCustomRepository(CharacterRepository)

    router.get('/chars', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const all = await characterRepository.findForCampaign({campaignId: req.campaign.id})
        const chars: CharacterData[] = all.filter(char => checkAccess('character:view', {
            profileId: req.profileId,
            role: req.campaignRole,
            hidden: !char.visible,
            ownerId: char.ownerId
        })).map(c => ({
            ...c,
            owner: c.ownerId,
            rawbody: JSON.parse(c.rawbody)
        }))

        const canCreate = checkAccess('character:view', {profileId: req.profileId, role: req.campaignRole})
        
        renderMain(req, res, {
            data: {characters: chars.reduce((coll, ch) => ({...coll, [ch.id]: ch}), {})},
            indices: {characters: chars.map(ch => ch.id)}
        })
    })

    router.get('/new-char', async (req, res, next) => {
        if (!checkAccess('character:view', {profileId: req.profileId, role: req.campaignRole}))
        {
            render(res.status(403), AccessDenied, {})
            return
        }

        render(res, NewCharacter, {})
    })

    const encodeChar = (char: CharacterModel|undefined) => {
        return char ? {
            id: char.id,
            title: char.title,
            slug: char.slug,
            owner: char.ownerId,
            visible: char.visible,
            portrait: char.portrait ? {contentMD5: char.portrait.contentMD5, extension: char.portrait.extension} : undefined,
            rawbody: char.rawbody,
        } : undefined
    }

    const serveCharacter = (req: Request, res: Response, char: CharacterModel|undefined, edit: boolean) => {
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

        const editable = checkAccess('character:edit', {profileId: req.profileId, role: req.campaignRole, ownerId: char.ownerId})

        if (edit)
        {
            if (!editable)
            {
                render(res.status(403), AccessDenied, {})
                return
            }

            const initial = encodeChar({...char, rawbody: scrubDraftSecrets(char.rawbody, secrets)})

            render(res, EditCharacter, {initial})
        }
        else
        {
            const props = {
                char: encodeChar({...char, rawbody: scrubDraftSecrets(char.rawbody, secrets)}),
                editable
            }

            render(res, ViewCharacter, props)
        }
    }

    router.get('/chars/c/:id(\\d+)/', async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const id = req.params['id']
        const edit = !!req.query['edit']
        const char = await characterRepository.fetchById({id, campaignId: req.campaign.id})
        serveCharacter(req, res, char, edit)
    })

    router.delete('/chars/c/:id(\\d+)/', async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const id = req.params['id']
        const char = await characterRepository.fetchById({id, campaignId: req.campaign.id})
        if (!char)
        {
            res.status(404).json({status: 'error', message: 'Not found.'})
            return
        }
        
        if (!checkAccess('character:edit', {profileId: req.profileId, role: req.campaignRole, ownerId: char.ownerId}))
        {
            res.status(403).json({status: 'error', message: 'Access denied.'})
            return
        }

        await characterRepository.deleteById(char.id)

        res.json({status: 'success', message: 'Character deleted.'})
    })

    router.get('/chars/c/:slug', async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const slug = req.params['slug']
        const edit = !!req.query['edit']
        const char = await characterRepository.fetchBySlug({slug, campaignId: req.campaign.id})
        serveCharacter(req, res, char, edit)
    })

    router.post('/chars', multer({limits: {fileSize: 1*1024*1024}}).single('portrait'), async (req, res, next) =>
    {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const secrets = checkAccess('character:view-secret', {profileId: req.profileId, role: req.campaignRole})

        const charId = req.body['id']
        const char = await characterRepository.fetchById({id: charId, campaignId: req.campaign.id})
        if (char)
        {
            if (!checkAccess('character:edit', {profileId: req.profileId, role: req.campaignRole, ownerId: char.ownerId}))
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
                ownerId: req.body['owner'] || char.ownerId,
                visible: !!req.body['visible']
            })
            await characterRepository.save(updatedChar)

            res.json({status: 'success', message: 'Character saved.', body: encodeChar({...updatedChar, rawbody: scrubDraftSecrets(updatedChar.rawbody, secrets)})})
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
                ownerId: req.body['owner'] || undefined,
                visible: !!req.body['visible']
            })
            await characterRepository.save(newChar)

            res.json({status: 'success', message: 'Character created.', body: encodeChar({...newChar, rawbody: scrubDraftSecrets(newChar.rawbody, secrets)})})
        }
    })

    return router
}