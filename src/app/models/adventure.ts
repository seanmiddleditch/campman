import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn, Index, EntityRepository, Repository} from 'typeorm'
import {CampaignModel} from './campaign'

@Entity({name: 'adventure'})
@Index(['campaignId'])
export class AdventureModel
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column({name: 'campaign_id'})
    public campaignId: number

    @ManyToOne(t => CampaignModel, l => l.pages)
    @JoinColumn({name: 'campaign_id'})
    public campaign: CampaignModel

    @Column()
    public visible: boolean

    @Column()
    public title: string

    @Column({type: 'text', default: ''})
    public rawbody: string

    @CreateDateColumn({name: 'created_at'})
    public createdAt: Date
}

@EntityRepository(AdventureModel)
export class AdventureRepository extends Repository<AdventureModel>
{
    public async findForCampaign({campaignId}: {campaignId: number})
    {
        return this.find({
            where: {campaignId},
            order: {createdAt: 'DESC'}
        })
    }

    public async fetchById({id, campaignId}: {id: number, campaignId: number})
    {
        return this.findOne({
            where: {id, campaignId}
        })
    }
}
