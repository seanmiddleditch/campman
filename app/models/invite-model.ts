import {Entity, Column, ManyToOne, JoinTable, EntityRepository, Repository, Connection} from 'typeorm'
import {Library} from './library-model'
import {Membership} from './membership-model'
import {Role} from '../auth'

@Entity()
export class Invitation
{
    @Column({primary: true, length: 24})
    public id: string

    @Column()
    public email: string

    @Column()
    public libraryId: number

    @ManyToOne(type => Library, l => l.invitations)
    @JoinTable()
    public library: Library
}

@EntityRepository(Invitation)
export class InvitationRepository extends Repository<Invitation>
{
    public async createInvitation(params: {code: string, email: string, libraryID: number})
    {
        await this.create({
            id: params.code,
            email: params.email,
            libraryId: params.libraryID
        })
    }

    public static async acceptInvite(conn: Connection, {code, userID}: {code: string, userID: number})
    {
        return conn.transaction(async (tx) => {
            const invite = await tx.getCustomRepository(InvitationRepository).findOneById(code)
            if (!invite)
            {
                return false
            }

            await tx.createQueryBuilder(Membership, 'membership')
                .insert()
                .values({
                    userId: userID,
                    libraryId: invite.libraryId,
                    role: Role.Player
                })
                .execute()

            await tx.createQueryBuilder(Invitation, 'invite')
                .delete()
                .where('"id"=:code', {code})
                .execute()

            return true
        })
    }
}
