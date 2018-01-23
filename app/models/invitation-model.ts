import {Entity, Column, ManyToOne, JoinColumn, EntityRepository, Repository, Connection} from 'typeorm'
import {CampaignModel} from './campaign'
import {MembershipModel} from './membership-model'
import {CampaignRole} from '../auth'

@Entity({name: 'invitation'})
export class InvitationModel
{
    @Column({primary: true, length: 24})
    public id: string

    @Column()
    public email: string

    @Column({name: 'library_id'})
    public campaignId: number

    @ManyToOne(type => CampaignModel, l => l.invitations)
    @JoinColumn({name: 'library_id'})
    public campaign: CampaignModel
}

@EntityRepository(InvitationModel)
export class InvitationRepository extends Repository<InvitationModel>
{
    public async createInvitation(params: {code: string, email: string, campaignId: number})
    {
        await this.create({
            id: params.code,
            email: params.email,
            campaignId: params.campaignId
        })
    }

    public static async acceptInvite(conn: Connection, {code, profileId}: {code: string, profileId: number})
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
                    profileId: profileId,
                    campaignId: invite.campaignId,
                    role: CampaignRole.Player
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
