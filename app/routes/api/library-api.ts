import {Request, Response, Router} from 'express'
import {LibraryModel, LibraryAccessModel, UserModel, InviteModel} from '../../models'
import * as squell from 'squell'
import {checkAccess, Role} from '../../auth/access'
import {LibraryController} from '../../controllers/library-controller'
import {Config} from '../../server'
import {wrapper} from '../helpers'
import * as slug from '../../util/slug'
import * as shortid from 'shortid'
import * as mailgun from 'mailgun-js'


export function libraryAPIRoutes(db: squell.Database, config: Config)
{
    const router = Router()
    const controller = new LibraryController(db)
    const mg = mailgun({apiKey: config.mailgunKey, domain: config.mailDomain})

    router.get('/api/libraries', wrapper(async (req, res) => {
        const result = await controller.listLibraries({userID: req.userID})

        res.json(result.libraries.filter(library => checkAccess({
            target: 'library:view',
            hidden: true,
            ownerID: library.creatorID,
            role: library.role,
            userID: req.userID
        })).map(library => ({slug: library.slug, title: library.title, role: library.role})))
    }))

    router.get('/api/libraries/:library', wrapper(async (req, res) => {
        const librarySlug = req.params.library

        const library = await db.query(LibraryModel)
            .attributes(m => [m.slug])
            .include(LibraryAccessModel, m => [m.acl, {required: false}], q => q
                .attributes(m => [m.role])
                .where(m => squell.attribute('userId').eq(req.userID).or(squell.attribute('userId').eq(null)))
            )
            .where(m => m.slug.eq(librarySlug))
            .findOne()

        if (!library)
        {
            res.status(404).json({message: 'Library not found'})
        }
        else if (!checkAccess({target: 'library:view', userID: req.userID, role: req.userRole, ownerID: library.creator.id}))
        {
            res.status(403).json({message: 'Access denied'})
        }
        else
        {
            res.json({slug: library.slug, title: library.title, role: req.userRole})
        }
    }))

    router.put('/api/libraries/:library', wrapper(async (req, res) => {
        if (!checkAccess({target: 'library:create', userID: req.userID, role: Role.Visitor}))
        {
            res.status(403).json({message: 'Access denied'})
        }
        else
        {
            const librarySlug = req.params.library
            const title = req.body.title

            if (!slug.isValid(librarySlug))
            {
                res.status(400).json({message: 'Invalid slug'})
            }

            const library = await db.transaction(async (tx) => {
                const user = await db.query(UserModel).where(m => m.id.eq(req.userID)).findOne()

                const newLibrary = new LibraryModel()
                newLibrary.slug = librarySlug
                newLibrary.title = title
                newLibrary.creator = user

                const library = await db.query(LibraryModel)
                    .include(UserModel, m => m.creator)
                    .create(newLibrary, {transaction: tx})
                
                const newAccess = new LibraryAccessModel()
                newAccess.library = library
                newAccess.user = user
                newAccess.role = Role.Owner
                const access = await db.query(LibraryAccessModel).includeAll().save(newAccess, {transaction: tx})

                return library
            })

            res.status(201).json(library)
        }
    }))

    router.get('/api/libraries/:library/settings', wrapper(async (req, res) => {
        if (!checkAccess({target: 'library:configure', userID: req.userID, role: req.userRole}))
        {
            res.status(403).json({message: 'Access denied'})
        }
        else
        {
            const library = await db.query(LibraryModel)
                .where(m => m.slug.eq(req.params['library']))
                .findOne()
            if (!library)
            {
                res.status(404).json({message: 'Library not found'})
            }
            else
            {
                const members = await db.query(LibraryAccessModel)
                    .attributes(m => [m.role])
                    .include(UserModel, m => m.user, q => q.attributes(m => [m.id, m.nickname]))
                    .where(m => squell.attribute('libraryId').eq(library.id))
                    .find()

                const mappedMembers = members.map(user => ({
                    role: user.role,
                    userID: user.user && user.user.id,
                    nickname: user.user && user.user.nickname
                }))

                res.status(200).json({
                    slug: library.slug,
                    title: library.title,
                    visibility: library.visibility,
                    members: mappedMembers
                })
            }
        }

    }))

    router.post('/api/libraries/:library/settings', wrapper(async (req, res) => {
        if (!checkAccess({target: 'library:configure', userID: req.userID, role: req.userRole}))
        {
            res.status(403).json({message: 'Access denied'})
        }
        else
        {
            const [count, libraries] = await db.query(LibraryModel)
                .where(m => m.slug.eq(req.params['library']))
                .update({
                    title: req.body['title'],
                    visibility: req.body['visibility']
                })
            res.status(200).json({})
        }
    }))

    router.post('/api/libraries/:library/members/invite', wrapper(async (req, res) => {
        if (!checkAccess({target: 'library:invite', userID: req.userID, role: req.userRole}))
        {
            res.status(403).json({message: 'Access denied'})
        }
        else
        {
            const id = shortid.generate()
            const email = req.body['email']
            const library = await db.query(LibraryModel)
                .attributes(m => [m.id, m.title])
                .where(m => m.id.eq(req.libraryID))
                .findOne()

            await db.query(InviteModel)
                .include(LibraryModel, m => m.library)
                .create(new InviteModel({
                    id,
                    email,
                    library
                }))

            const result = await new Promise<string>((resolve, reject) => {
                mg.messages().send({
                    from: config.inviteAddress,
                    to: email,
                    subject: `You Are Invited to ${library.title} at the Eternal Dungeon!`,
                    text: `You have been invited to ${library.title} by ${req.user.nickname}. Go to ${config.publicURL.toString()}invite/${id} to join! If this message appears to be in error, please ignore it.`
                }, (err, body) => {
                    if (err) reject(err)
                    else resolve(body)
                })
            })
        }
    }))
    

    router.post('/api/libraries/:library/members/:userid', wrapper(async (req, res) => {
        if (!checkAccess({target: 'library:configure', userID: req.userID, role: req.userRole}))
        {
            res.status(403).json({message: 'Access denied'})
        }
        else
        {
            const newRole = req.body['role']
            if (newRole != Role.Visitor)
            {
                await db.query(LibraryAccessModel)
                    .include(LibraryModel, m => m.library, q => q.where(m => m.slug.eq(req.params['library'])))
                    .where(m => squell.attribute('userId').eq(req.params['userid']))
                    .update({
                        role: req.body['role']
                    })
            }
            else
            {
                await db.query(LibraryAccessModel)
                    .include(LibraryModel, m => m.library, q => q.where(m => m.slug.eq(req.params['library'])))
                    .where(m => squell.attribute('userId').eq(req.params['userid']))
                    .destroy()
            }

            res.status(200).json({})
        }
    }))

    router.post('/api/invitation/accept/:code', wrapper(async (req, res) => {
        const invite = await db.query(InviteModel)
            .include(LibraryModel, m => m.library)
            .where(m => m.id.eq(req.params['code']))
            .findOne()

        if (!invite)
        {
            res.status(404).json({message: 'Invalid or expired invitation code'})
        }
        else
        {
            const user = await db.query(UserModel).where(m => m.id.eq(req.userID)).findOne()
            const {library} = invite

            await db.transaction(async (tx) => {
                const newAccess = new LibraryAccessModel()
                newAccess.library = library
                newAccess.user = user
                newAccess.role = Role.Player

                await db.query(LibraryAccessModel)
                    .includeAll()
                    .save(newAccess, {transaction: tx})

                await db.query(InviteModel)
                    .where(m => m.id.eq(invite.id))
                    .destroy({transaction: tx})
            })

            res.status(200).json({message: 'Invitation accepted!'})
        }
    }))

    return router
}