import PromiseRouter = require('express-promise-router')
import {PageModel, PageRepository, PageVisibility, TagRepository} from '../../models'
import {connection} from '../../db'
import {config} from '../../config'
import {URL} from 'url'
import {checkAccess} from '../../auth'
import {draftToHtml} from '../../util/draft-to-html'
import * as slugUtils from '../../util/slug-utils'

export function wiki() {
    const router = PromiseRouter()
    const pageRepository = connection().getCustomRepository(PageRepository)
    const tagRepository = connection().getCustomRepository(TagRepository)

    router.get('/wiki', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const all = await pageRepository.findForCampaign({campaignId: req.campaign.id})

        const canCreate = checkAccess({target: 'page:create', profileId: req.profileId, role: req.campaignRole})

        res.render('list-pages', {
            pages: all.filter(page => checkAccess({
                target: 'page:view',
                profileId: req.profileId,
                role: req.campaignRole,
                ownerId: page.authorId,
                hidden: page.visibility !== PageVisibility.Public
            })).map(page => ({
                ...page,
                editable: checkAccess({target: 'page:edit', profileId: req.profileId, role: req.campaignRole, ownerId: page.authorId, hidden: page.visibility !== PageVisibility.Public})
            })),
            canCreate
        })
    })

    router.get('/wiki/new', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        if (!checkAccess({target: 'page:create', profileId: req.profileId, role: req.campaignRole}))
        {
            res.status(403)
            res.json({status: 'access denied'})
        }

        res.render('edit-page', {page: {}})
    })

    router.get('/w/:slug/edit', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const inSlug = req.params['slug'];

        const page = await pageRepository.fetchBySlug({slug: inSlug, campaignId: req.campaign.id})
        if (!page)
        {
            res.status(404)
            return res.render('not-found')
        }

        if (!checkAccess({target: 'page:edit', profileId: req.profileId, role: req.campaignRole, ownerId: page.authorId, hidden: page.visibility !== PageVisibility.Public}))
        {
            res.status(403)
            return res.render('access-denied')
        }

        const {slug, title, rawbody, tags, visibility} = page
        res.render('edit-page', {
            page: {slug, title, rawbody, tags, visibility}
        })
    })

    router.get('/w/:slug', async (req, res, next) => {
        if (!req.campaign)
            throw new Error('Missing campaign')

        const inSlug = req.params['slug'];

        const page = await pageRepository.fetchBySlug({slug: inSlug, campaignId: req.campaign.id})
        if (!page)
        {
            res.status(404)
            return res.render('not-found')
        }

        if (!checkAccess({target: 'page:view', profileId: req.profileId, role: req.campaignRole, ownerId: page.authorId, hidden: page.visibility !== PageVisibility.Public}))
        {
            res.status(403)
            return res.render('access-denied')
        }

        const {slug, title, rawbody, tags, visibility} = page

        const secrets = checkAccess({
            target: 'page:view-secret',
            profileId: req.profileId,
            role: req.campaignRole,
            ownerId: page.authorId,
            hidden: page.visibility !== PageVisibility.Public
        })
        const editable = checkAccess({
            target: 'page:edit',
            profileId: req.profileId,
            role: req.campaignRole,
            ownerId: page.authorId,
            hidden: page.visibility !== PageVisibility.Public
        })

        const body = draftToHtml(rawbody, secrets)

        res.render('view-page', {
            page: {slug, title, body, rawbody: editable ? rawbody : undefined, tags, visibility, editable}
        })
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
            res.status(400).json({status: 'Missing slug'})
            return
        }
        const page = await pageRepository.fetchBySlug({slug, campaignId: req.campaign.id})

        const campaignId = req.campaign.id

        const visibility = req.body['visibility'] as PageVisibility|undefined
        
        const rawbody = req.body['rawbody']

        const labels = 'labels' in req.body ? tagRepository.fromString(req.body['labels']) : []

        if (page)
        {
            if (!checkAccess({target: 'page:edit', profileId: req.profileId, role: req.campaignRole, ownerId: page.authorId, hidden: page.visibility !== PageVisibility.Public}))
            {
                res.status(403).json({status: 'access denied'})
                return
            }

            await pageRepository.updatePage({
                slug,
                campaignId,
                title: title || page.title,
                rawbody: rawbody || '',
                labels,
                visibility: visibility || page.visibility
            })

            if (req.accepts('application/json'))
                res.json({status: 'success', location: `/w/${page.slug}`})
            else
                res.redirect(`/w/${page.slug}`)
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
            if (!checkAccess({target: 'page:create', profileId: req.profileId, role: req.campaignRole}))
            {
                res.status(403).json({status: 'access denied'})
                return
            }

            const page = await pageRepository.createPage({
                slug,
                authorID: req.profileId,
                campaignId,
                title,
                rawbody,
                labels,
                visibility: visibility || PageVisibility.Public
            })

            if (req.accepts('application/json'))
                res.json({status: 'success', location: `/w/${page.slug}`})
            else
                res.redirect(`/w/${page.slug}`)
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
    //         else if (!checkAccess({target: 'page:delete', profileId: req.profileId, role: req.userRole, ownerID: result.page.authorID}))
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