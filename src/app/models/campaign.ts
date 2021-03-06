import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, Index, ManyToOne, OneToMany, EntityRepository, JoinColumn, Repository, Connection} from 'typeorm'
import {PageModel, PageRepository, PageVisibility} from './page'
import {ProfileModel} from './profile'
import {MembershipModel} from './membership-model'
import {InvitationModel} from './invitation-model'
import {CampaignRole} from '../auth/access'

export enum CampaignVisibility
{
    Public = 'Public',
    Hidden = 'Hidden'
}

@Entity({name: 'library'})
@Index(['id', 'slug'], {unique: true})
export class CampaignModel
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    public slug: string

    @Column()
    public title: string

    @Column()
    public visibility: CampaignVisibility

    @OneToMany(t => PageModel, n => n.campaign)
    public pages: PageModel[]

    @OneToMany(t => MembershipModel, m => m.campaign)
    public memberships: MembershipModel[]

    @OneToMany(t => InvitationModel, i => i.campaign)
    public invitations: InvitationModel[]
}

@EntityRepository(CampaignModel)
export class CampaignRepository extends Repository<CampaignModel>
{
    public async findAllForProfile({profileId}: {profileId: number})
    {
        return this.createQueryBuilder('library')
            .leftJoinAndMapOne('role', 'library.memberships', 'membership', 'membership.account_id=:profileId', {profileId})
            .getRawMany()
            .then(results => results.map(row => ({
                    id: row.library_id as number,
                    slug: row.library_slug as string,
                    title: row.library_title as string,
                    visibility: row.library_visibility as CampaignVisibility,
                    role: row.membership_role as CampaignRole || CampaignRole.Visitor
                })))
    }

    public async findBySlug({slug, withMembers}: {slug: string, withMembers?: boolean})
    {
        return this.findOne({
            where: {
                slug
            },
            relations: ['memberships']
        })
    }

    public static async createNewCampaign(conn: Connection, {slug, title, profileId}: {slug: string, title: string, profileId: number})
    {
        return conn.transaction(async (tx) => {
            const campaignRepo = tx.getCustomRepository(CampaignRepository)
            const campaign = campaignRepo.create({
                slug,
                title,
                visibility: CampaignVisibility.Public
            })
            await campaignRepo.save(campaign)
            
            const memberships = tx.getRepository(MembershipModel)
            const member = memberships.create({
                profileId,
                campaignId: campaign.id,
                role: CampaignRole.Owner
            })
            await memberships.save(member)

            const pageRepository = tx.getCustomRepository(PageRepository)
            const homePage = pageRepository.create({
                title: 'Home',
                slug: 'home',
                visibility: PageVisibility.Public,
                campaignId: campaign.id,
                authorId: profileId,
                rawbody: '{"entityMap":{},"blocks":[{"key":"4kmc9","text":"Welcome to your new Campaign!","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]}'
            })
            await pageRepository.save(homePage)

            return campaign
        })
    }

    public async updateCampaign({slug, title, visibility}: {slug: string, title?: string, visibility?: CampaignVisibility})
    {
        await this.createQueryBuilder('library')
            .where('"slug"=:slug', {slug})
            .update({
                title,
                visibility
            })
            .execute()
    }
}