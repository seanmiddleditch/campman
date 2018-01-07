import {Connection} from 'typeorm'
import {Request, Response, Router} from 'express'
import {Library, LibraryRepository, LibraryVisibility, Membership, MembershipRepository, User, Invitation, InvitationRepository} from '../../models'
import {checkAccess, Role} from '../../auth/access'
import {Config} from '../../config'
import {wrapper, ok, fail} from '../helpers'
import * as slug from '../../util/slug'
import * as shortid from 'shortid'
import * as mailgun from 'mailgun-js'

export function members(conn: Connection, config: Config)
{
    const router = Router()
    const mg = mailgun({apiKey: config.mailgunKey, domain: config.mailDomain})

    const membershipRepository = conn.getCustomRepository(MembershipRepository)
    const libraryRepository = conn.getCustomRepository(LibraryRepository)
    const inviteRepository = conn.getCustomRepository(InvitationRepository)

    router.get('/api/libraries/:library/members', wrapper(async (req, res) => {
        if (!checkAccess({target: 'library:configure', userID: req.userID, role: req.userRole}))
        {
            fail(res, 403, 'Access denied')
        }
        else
        {
            const members = await membershipRepository.findMembersForLibrary({libraryID: req.libraryID})

            const mappedMembers = members.map(user => ({
                role: user.role,
                id: user.id,
                nickname: user.nickname
            }))

            ok(res, mappedMembers)
        }
    }))

    router.post('/api/libraries/:library/members/invite', wrapper(async (req, res) => {
        const library = await libraryRepository.findOneById(req.libraryID)

        if (!library)
        {
            fail(res, 404, 'Library not found')
        }
        else if (!checkAccess({target: 'library:invite', userID: req.userID, role: req.userRole}))
        {
            fail(res, 403, 'Access denied')
        }
        else
        {
            const code = shortid.generate()
            const email = req.body['email']

            await inviteRepository.createInvitation({
                code,
                email,
                libraryID: req.libraryID
            })

            const result = await new Promise<string>((resolve, reject) => {
                mg.messages().send({
                    from: config.inviteAddress,
                    to: email,
                    subject: `You Are Invited to ${library.title} at the Eternal Dungeon!`,
                    text: `You have been invited to ${library.title} by ${req.user.nickname}. Go to ${config.publicURL.toString()}invite/${code} to join! If this message appears to be in error, please ignore it.`
                }, (err, body) => {
                    if (err) reject(err)
                    else resolve(body)
                })
            })

            ok(res, {})
        }
    }))
    

    router.post('/api/libraries/:library/members/:userid', wrapper(async (req, res) => {
        const targetUserID = req.params['userid']
        if (!checkAccess({target: 'library:configure', userID: req.userID, role: req.userRole}))
        {
            fail(res, 403, 'Access denied')
        }
        else
        {
            const newRole = req.body['role']

            membershipRepository.updateRole({libraryID: req.libraryID, userID: targetUserID, role: newRole})

            ok(res, {})
        }
    }))

    router.post('/api/invitation/accept/:code', wrapper(async (req, res) => {
        const code = req.params['code']

        const invite = await inviteRepository.findOneById(code)

        if (!invite)
        {
            fail(res, 404, 'Invalid or expired invitation code')
        }
        else
        {
            const {library} = invite

            const success = await InvitationRepository.acceptInvite(conn, {code, userID: req.userID})

            if (success)
            {
                ok(res, {})
            }
            else
            {
                fail(res, 400, 'Invalid or expire invitation code')
            }
        }
    }))


    return router
}