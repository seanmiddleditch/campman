import PromiseRouter = require('express-promise-router')
import { PageModel, PageRepository, PageVisibility, TagRepository } from '../../models'
import { connection } from '../../db'
import { config } from '../../config'
import { URL } from 'url'
import { checkAccess } from '../../auth'
import { scrubDraftSecrets } from '../../../common/draft-utils'
import * as slugUtils from '../../../common/slug-utils'
import { render, renderMain } from '../../react-ssr'
import { ViewWiki } from '../../../components/pages/view-wiki'
import { EditWiki } from '../../../components/pages/edit-wiki'
import { NewWiki } from '../../../components/pages/new-wiki'
import { ListWiki } from '../../../components/pages/list-wiki'
import { AccessDenied } from '../../../components/pages/access-denied'
import { NotFound } from '../../../components/pages/not-found'
import { WikiPageData } from '../../../types/content'

export function wiki() {
    const router = PromiseRouter()
    const pageRepository = connection().getCustomRepository(PageRepository)
    const tagRepository = connection().getCustomRepository(TagRepository)

    router.get('/wiki', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const all = await pageRepository.findForCampaign({campaignId: req.campaign.id})

        const canCreate = checkAccess('page:create', {profileId: req.profileId, role: req.campaignRole})

        const pages: WikiPageData[] = all.filter(page => checkAccess('page:view', {
            profileId: req.profileId,
            role: req.campaignRole,
            ownerId: page.authorId,
            hidden: page.visibility !== PageVisibility.Public
        })).map(page => ({
            ...page,
            rawbody: {entityMap: {}, blocks: []},
            tags: '',
            editable: checkAccess('page:edit', {profileId: req.profileId, role: req.campaignRole, ownerId: page.authorId, hidden: page.visibility !== PageVisibility.Public})
        }))

        renderMain(req, res, {
            data: {pages: pages.reduce((coll, page) => ({...coll, [page.id]: page}), {})},
            indices: {pages: pages.map(page => page.id)}
        })
    })

    router.get('/new-wiki', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess('page:create', {profileId: req.profileId, role: req.campaignRole}))
        {
            render(res.status(403), AccessDenied, {})
            return
        }

        render(res, NewWiki, {})
    })

    router.get('/wiki/p/:slug', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const inSlug = req.params['slug'];

        const page = await pageRepository.fetchBySlug({slug: inSlug, campaignId: req.campaign.id})
        if (!page)
        {
            render(res.status(404), NotFound, {})
            return
        }

        if (!checkAccess('page:view', {profileId: req.profileId, role: req.campaignRole, ownerId: page.authorId, hidden: page.visibility !== PageVisibility.Public}))
        {
            render(res.status(403), AccessDenied, {})
            return
        }

        const {id, slug, title, rawbody, tags, visibility} = page

        const secrets = checkAccess('page:view-secret', {
            profileId: req.profileId,
            role: req.campaignRole,
            ownerId: page.authorId,
            hidden: page.visibility !== PageVisibility.Public
        })
        const editable = checkAccess('page:edit', {
            profileId: req.profileId,
            role: req.campaignRole,
            ownerId: page.authorId,
            hidden: page.visibility !== PageVisibility.Public
        })

        if (!!req.query['edit'])
        {
            if (!editable) {
                render(res.status(403), AccessDenied, {})
                return
            }

            render(res, EditWiki, {initial: {...page, rawbody: JSON.parse(rawbody)}})
        }
        else
        {
            const props = {
                id,
                slug: slug || '',
                title,
                rawbody: scrubDraftSecrets(rawbody, secrets),
                tags,
                visibility,
                editable
            }
            render(res, ViewWiki, props)
        }
    })

    router.delete('/wiki/:id', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const id = req.params['id']

        const page = await pageRepository.findOne({campaignId: req.campaign.id, id})
        if (!page)
        {
            render(res.status(404), NotFound, {})
            return
        }

        const deletable = checkAccess('page:edit', {
            profileId: req.profileId,
            role: req.campaignRole,
            ownerId: page.authorId,
            hidden: page.visibility !== PageVisibility.Public
        })

        if (!deletable)
        {
            res.status(403).json({status: 'error', message: 'Access denied.'})
            return
        }

        await pageRepository.deleteById(page.id)

        res.json({status: 'success', message: 'Page deleted.'})
    })

    router.post('/wiki', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')
        
        const title = req.body['title'] as string|undefined
        let slug = req.body['slug'] as string|undefined
        if (!slug && title)
            slug = slugUtils.sanitize(title)

        if (!slug)
        {
            res.status(400).json({status: 'error', message: 'Missing slug.', fields: {slug: 'Required.'}})
            return
        }
        const page = await pageRepository.fetchBySlug({slug, campaignId: req.campaign.id})

        const campaignId = req.campaign.id

        const visibility = req.body['visibility'] as PageVisibility|undefined
        
        const rawbody = req.body['rawbody']

        const tags = 'tags' in req.body ? tagRepository.fromString(req.body['tags']) : []

        if (page)
        {
            if (!checkAccess('page:edit', {profileId: req.profileId, role: req.campaignRole, ownerId: page.authorId, hidden: page.visibility !== PageVisibility.Public}))
            {
                res.status(403).json({status: 'error', message: 'Access denied.'})
                return
            }

            await pageRepository.updatePage({
                slug,
                campaignId,
                title: title || page.title,
                rawbody: rawbody || '',
                tags,
                visibility: visibility || page.visibility
            })

            if (req.accepts('application/json'))
                res.json({status: 'success', data: {location: `/wiki/p/${page.slug}`}})
            else
                res.redirect(`/wiki/p/${page.slug}`)
            // return res.json({
            //     status: 'success',
            //     body: {
            //         slug,
            //         campaignId,
            //         title: title || page.title,
            //         subtitle: subtitle || page.subtitle,
            //         rawbody: rawbody || page.rawbody,
            //         labels: labels || page.labels,
            //         visibility: visibility || page.visibility
            //     }
            // })
        }
        else
        {
            if (!checkAccess('page:create', {profileId: req.profileId, role: req.campaignRole}))
            {
                res.status(403).json({status: 'error', message: 'Access denied.'})
                return
            }

            const page = await pageRepository.createPage({
                slug,
                authorID: req.profileId,
                campaignId,
                title,
                rawbody,
                tags,
                visibility: visibility || PageVisibility.Public
            })

            if (req.accepts('application/json'))
                res.json({status: 'success', data: {location: `/wiki/p/${page.slug}`}})
            else
                res.redirect(`/wiki/p/${page.slug}`)
            // res.json({
            //     status: 'success',
            //     body: {
            //         slug,
            //         campaignId,
            //         title: page.title,
            //         subtitle: page.subtitle,
            //         rawbody: page.rawbody,
            //         labels: page.labels,
            //         visibility: nopagete.visibility
            //     }
            // })
        }
    })

    // router.delete('/api/wiki/:page', wrapper(async (req, res) => {
    //     if (!req.campaign)
    //     {
    //         res.status(404).json({message: 'Library not found'})
    //     }
    //     else
    //     {
    //         const result = await controller.fetchNote({noteSlug: req.params['page'], campaignId: req.campaign.id})
    //         if (!result.page)
    //         {
    //             res.status(404).json({message: 'Page not found'})
    //         }
    //         else if (!checkAccess('page:delete', {profileId: req.profileId, role: req.userRole, ownerID: result.page.authorID}))
    //         {
    //             res.status(403).json({message: 'Access denied'})
    //         }
    //         else
    //         {
    //             const count = await controller.deleteNote({noteSlug: req.params['page'], campaignId: req.campaign.id})
    //             res.json({deleted: count.deleted})
    //         }
    //     }
    // }))

    return router
}