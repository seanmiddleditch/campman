import {Entity, Column, ManyToOne, PrimaryGeneratedColumn, JoinColumn, EntityRepository, Repository} from 'typeorm'
import {MediaModel} from './media'
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

    @Column({name: 'media_id'})
    public mediaId: number;

    @ManyToOne(t => MediaModel)
    @JoinColumn({name: 'media_id'})
    public media?: MediaModel
}

@EntityRepository(MapModel)
export class MapRepository extends Repository<MapModel>
{
    public async findByCampaign({campaignId}: {campaignId: number})
    {
        return this.find({
            select: [
                'id',
                'title',
                'media'
            ],
            where: {
                campaignId: campaignId
            }
        })
    }
}