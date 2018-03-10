import {Entity, Column, ManyToOne, PrimaryGeneratedColumn, JoinColumn, EntityRepository, Repository} from 'typeorm'
import {MediaStorageModel} from './media'
import {CampaignModel} from './campaign'

@Entity({name: 'map'})
export class MapModel
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column({name: 'library_id'})
    public campaignId: number;

    @ManyToOne(t => CampaignModel)
    @JoinColumn({name: 'library_id'})
    public campaign: CampaignModel;

    @Column()
    public title: string

    @Column()
    public slug: string

    @Column()
    public rawbody: string

    @Column({name: 'storage_id'})
    public storageId: number;

    @ManyToOne(t => MediaStorageModel)
    @JoinColumn({name: 'storage_id'})
    public storage: MediaStorageModel
}

@EntityRepository(MapModel)
export class MapRepository extends Repository<MapModel>
{
    public async findByCampaign({campaignId}: {campaignId: number})
    {
        return this.find({
            select: ['id', 'title', 'storageId', 'slug'],
            where: {campaignId},
            relations: ['storage']
        })
    }

    public fetchBySlug({slug, campaignId}: {slug: string, campaignId: number}) : Promise<MapModel|undefined>
    {
        return this.findOne({where: {slug, campaignId}, relations: ['storage']})
    }
}