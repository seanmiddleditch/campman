import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, Index, ManyToOne, OneToMany, EntityRepository, JoinColumn, Repository, Connection} from 'typeorm'
import {CampaignModel} from './campaign'
import {ProfileModel} from './profile'
import {CampaignRole} from '../auth'

@Entity({name: 'membership'})
export class MembershipModel
{
    @PrimaryColumn({name: 'library_id'})
    public campaignId: number

    @ManyToOne(t => CampaignModel, l => l.memberships)
    @JoinColumn({name: 'library_id'})
    public campaign: CampaignModel

    @PrimaryColumn({name: 'account_id'})
    public profileId: number

    @ManyToOne(t => ProfileModel, u => u.membership)
    @JoinColumn({name: 'account_id'})
    public profile: ProfileModel

    @Column()
    public role: CampaignRole
}

@EntityRepository(MembershipModel)
export class MembershipRepository extends Repository<MembershipModel>
{
    public async findRoleForProfile(options: {profileId: number, campaignId: number})
    {
        const rs = await this.findOne({
            where: {
                profileId: options.profileId,
                campaignId: options.campaignId
            }
        })
        return rs ? rs.role : CampaignRole.Visitor
    }

    public async findForCampaign({campaignId}: {campaignId: number})
    {
        const memberships = await this.createQueryBuilder('membership')
            .innerJoinAndSelect('membership.profile', 'profile')
            .getMany()
        return memberships.map(membership => ({
            role: membership.role,
            ...membership.profile
        }))
    }

    public async updateRole(params: {profileId: number, campaignId: number, role: CampaignRole})
    {
        await this.createQueryBuilder('membership')
            .update({
                profileId: params.profileId,
                campaignId: params.campaignId,
                role: params.role
            })
            .execute()
    }
}