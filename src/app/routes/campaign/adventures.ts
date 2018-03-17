import {Request, Response} from 'express'
import {checkAccess} from '../../auth'
import {AdventureRepository} from '../../models'
import {connection} from '../../db'
import PromiseRouter = require('express-promise-router')
import {render} from '../../react-ssr'
import {AccessDenied} from '../../../components/pages/access-denied'
import {NotFound} from '../../../components/pages/not-found'
import {ListAdventures} from '../../../components/pages/list-adventures'
import {NewAdventure} from '../../../components/pages/new-adventure'
import {EditAdventure} from '../../../components/pages/edit-adventure'
import {ViewAdventure} from '../../../components/pages/view-adventure'
import {validateDraft} from '../../../common/draft-utils'

export function adventures()
{
    const router = PromiseRouter()
    const adventureRepository = connection().getCustomRepository(AdventureRepository)

    router.get('/adventures', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const all = await adventureRepository.findForCampaign({campaignId: req.campaign.id})
        if (!all)
        {
            render(res.status(404), NotFound, {})
            return
        }

        const filtered = all.filter(map => checkAccess('adventure:view', {
            profileId: req.profileId,
            role: req.campaignRole
        })).map(m => ({
            id: m.id,
            title: m.title,
            rawbody: JSON.parse(m.rawbody),
            created_at: m.createdAt.toUTCString(),
            editable: checkAccess('adventure:edit', {profileId: req.profileId, role: req.campaignRole})
        }))

        const canCreate = checkAccess('adventure:create', {
            profileId: req.profileId,
            role: req.campaignRole
        })

        render(res, ListAdventures, {adventures: filtered, canCreate})
    })

    router.get('/adventures/:id', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const adventure = await adventureRepository.findOneById({campaignId: req.campaign.id, id: req.params['id']})
        if (!adventure)
        {
            render(res.status(404), NotFound, {})
            return
        }

        if (!req.query['edit'])
        {
            if (!checkAccess('adventure:view', {profileId: req.profileId, role: req.campaignRole}))
            {
                render(res.status(403), AccessDenied, {})
                return
            }

            render(res, ViewAdventure, {
                adventure: {
                    id: adventure.id,
                    title: adventure.title,
                    rawbody: JSON.parse(adventure.rawbody),
                    created_at: adventure.createdAt.toUTCString(),
                },
                editable: checkAccess('adventure:edit', {profileId: req.profileId, role: req.campaignRole})
            })
        }
        else
        {
            if (!checkAccess('adventure:edit', {profileId: req.profileId, role: req.campaignRole}))
            {
                render(res.status(403), AccessDenied, {})
                return
            }

            render(res, EditAdventure, {
                initial: {
                    id: adventure.id,
                    title: adventure.title,
                    rawbody: JSON.parse(adventure.rawbody),
                    created_at: adventure.createdAt.toUTCString(),
                },
                editable: checkAccess('adventure:edit', {profileId: req.profileId, role: req.campaignRole})
            })
        }
    })
    
    router.post('/adventures/:id', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const adventure = await adventureRepository.findOne({campaignId: req.campaign.id, id: req.params['id']})
        if (!adventure)
        {
            render(res.status(404), NotFound, {})
            return
        }

        if (!checkAccess('adventure:edit', {profileId: req.profileId, role: req.campaignRole}))
        {
            render(res.status(403), AccessDenied, {})
            return
        }

        const title = req.body['title'] as string|undefined
        const rawbody = req.body['rawbody'] as string|undefined
        const visible = req.body['visible'] === 'visible'

        if (typeof title !== 'string' || title.length === 0)
        {
            res.status(400).json({status: 'error', message: 'Missing title', fields: {title: 'Required'}})
            return
        }
        if (!rawbody || !validateDraft(rawbody))
        {
            res.status(400).json({status: 'error', message: 'Form submission failed', fields: {rawbody: 'Processing error'}})
            return
        }

        adventure.title = title
        adventure.rawbody = rawbody
        await adventureRepository.save(adventure)

        res.json({status: 'success', message: 'Adventure amended!', body: {...adventure, rawbody: JSON.parse(adventure.rawbody)}})
    })

    router.delete('/adventures/:id', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const adventure = await adventureRepository.findOne({campaignId: req.campaign.id, id: req.params['id']})
        if (!adventure)
        {
            render(res.status(404), NotFound, {})
            return
        }

        if (!checkAccess('adventure:edit', {profileId: req.profileId, role: req.campaignRole}))
        {
            render(res.status(403), AccessDenied, {})
            return
        }

        await adventureRepository.deleteById(adventure.id)

        res.json({status: 'success', message: 'Adventure deleted.'})
    })
 
    router.get('/new-adventure', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess('adventure:create', {
            profileId: req.profileId,
            role: req.campaignRole
        }))
        {
            render(res.status(403), AccessDenied, {})
            return
        }

        render(res, NewAdventure, {})
    })

    router.post('/new-adventure', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess('adventure:create', {
            profileId: req.profileId,
            role: req.campaignRole
        }))
        {
            render(res.status(403), AccessDenied, {})
            return
        }

        const title = req.body['title'] as string|undefined
        const rawbody = req.body['rawbody'] as string|undefined
        const visible = req.body['visible'] === 'visible'

        if (typeof title !== 'string' || title.length === 0)
        {
            res.status(400).json({status: 'error', message: 'Missing title', fields: {title: 'Required'}})
            return
        }
        if (!rawbody || !validateDraft(rawbody))
        {
            res.status(400).json({status: 'error', message: 'Form submission failed', fields: {rawbody: 'Processing error'}})
            return
        }

        const adventure = adventureRepository.create({
            campaignId: req.campaign.id,
            title,
            rawbody,
            visible
        })
        await adventureRepository.save(adventure)

        res.json({status: 'success', message: 'Adventure recorded!', body: {...adventure, rawbody: JSON.parse(adventure.rawbody)}})
    })

    return router
}