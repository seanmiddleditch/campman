import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn, Index, EntityRepository, Repository} from 'typeorm'
import {MediaStorageModel} from './media'
import {CampaignModel} from './campaign'
import {ProfileModel} from './profile'

@Entity({name: 'character'})
@Index(['campaignId', 'slug'])
export class CharacterModel
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column({name: 'library_id'})
    public campaignId: number

    @ManyToOne(t => CampaignModel, l => l.pages)
    @JoinColumn({name: 'library_id'})
    public campaign: CampaignModel

    @Column()
    public slug: string

    @Column()
    public visible: boolean

    @Column()
    public alive: boolean

    @Column()
    public title: string

    @Column({type: 'text', default: ''})
    public rawbody: string

    @Column({name: 'owner_id'})
    public ownerId: number

    @ManyToOne(t => ProfileModel)
    @JoinColumn({ name: 'owner_id' })
    public owner: ProfileModel

    @Column({ name: 'portrait_id' })
    public portraitStorageId: number

    @ManyToOne(t => MediaStorageModel)
    @JoinColumn({ name: 'portrait_id' })
    public portrait: MediaStorageModel
}

@EntityRepository(CharacterModel)
export class CharacterRepository extends Repository<CharacterModel>
{
    public async findForCampaign({campaignId}: {campaignId: number})
    {
        return this.find({
            where: {campaignId},
            relations: ['portrait']
        })
    }

    public async fetchBySlug({slug, campaignId}: {slug: string, campaignId: number})
    {
        return this.findOne({
            where: {slug, campaignId},
            relations: ['portrait']
        })
    }

    public async fetchById({id, campaignId}: {id: number, campaignId: number})
    {
        return this.findOne({
            where: {id, campaignId},
            relations: ['portrait']
        })
    }
}
