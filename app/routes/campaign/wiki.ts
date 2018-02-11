import PromiseRouter = require('express-promise-router')
import {PageModel, PageRepository, PageVisibility, TagRepository} from '../../models'
import {connection} from '../../db'
import {config} from '../../config'
import {URL} from 'url'
import {checkAccess} from '../../auth'
import {scrubDraftSecrets} from '../../util/scrub-draft-secrets'
import * as slugUtils from '../../util/slug-utils'
import {RenderReact} from '../../util/react-ssr'
import {ViewWiki} from '../../../common/components/pages/view-wiki'
import {ListWiki} from '../../../common/components/pages/list-wiki'

export function wiki() {
    const router = PromiseRouter()
    const pageRepository = connection().getCustomRepository(PageRepository)
    const tagRepository = connection().getCustomRepository(TagRepository)

    router.get('/wiki', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const all = await pageRepository.findForCampaign({campaignId: req.campaign.id})

        const canCreate = checkAccess('page:create', {profileId: req.profileId, role: req.campaignRole})

        const pages = all.filter(page => checkAccess('page:view', {
            profileId: req.profileId,
            role: req.campaignRole,
            ownerId: page.authorId,
            hidden: page.visibility !== PageVisibility.Public
        })).map(page => ({
            ...page,
            editable: checkAccess('page:edit', {profileId: req.profileId, role: req.campaignRole, ownerId: page.authorId, hidden: page.visibility !== PageVisibility.Public})
        }))

        const props = {editable: canCreate, pages}

        RenderReact(res, ListWiki, props)
    })

    router.get('/wiki/p/:slug', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const inSlug = req.params['slug'];

        const page = await pageRepository.fetchBySlug({slug: inSlug, campaignId: req.campaign.id})
        if (!page)
        {
            res.status(404)
            return res.render('not-found')
        }

        if (!checkAccess('page:view', {profileId: req.profileId, role: req.campaignRole, ownerId: page.authorId, hidden: page.visibility !== PageVisibility.Public}))
        {
            res.status(403)
            return res.render('access-denied')
        }

        const {slug, title, rawbody, tags, visibility} = page

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

        const props = {
            slug: slug || '', title, body: scrubDraftSecrets(rawbody, secrets), tags, visibility,
            editable
        }
        RenderReact(res, ViewWiki, props)
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
            res.status(400).json({status: 'error', message: 'Missing slug.'})
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