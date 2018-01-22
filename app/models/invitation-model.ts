import {Entity, Column, ManyToOne, JoinColumn, EntityRepository, Repository, Connection} from 'typeorm'
import {LibraryModel} from './library-model'
import {MembershipModel} from './membership-model'
import {Role} from '../auth'

@Entity({name: 'invitation'})
export class InvitationModel
{
    @Column({primary: true, length: 24})
    public id: string

    @Column()
    public email: string

    @Column({name: 'library_id'})
    public libraryId: number

    @ManyToOne(type => LibraryModel, l => l.invitations)
    @JoinColumn({name: 'library_id'})
    public library: LibraryModel
}

@EntityRepository(InvitationModel)
export class InvitationRepository extends Repository<InvitationModel>
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

            await tx.createQueryBuilder(MembershipModel, 'membership')
                .insert()
                .values({
                    accountId: userID,
                    libraryId: invite.libraryId,
                    role: Role.Player
                })
                .execute()

            await tx.createQueryBuilder(InvitationModel, 'invite')
                .delete()
                .where('"id"=:code', {code})
                .execute()

            return true
        })
    }
}
