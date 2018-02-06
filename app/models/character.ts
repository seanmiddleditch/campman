import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn, Index, EntityRepository, Repository} from 'typeorm'
import {MediaStorageModel} from './media'
import {CampaignModel} from './campaign'

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
        return this.createQueryBuilder('character')
            .where('character.library_id=:campaignId', {campaignId})
            .getRawMany()
            .then(results => results.map(row => ({
                    id: row.character_id as number,
                    portraitStorageId: row.character_portrait_id as number|null,
                    slug: row.character_slug as string|null,
                    title: row.character_title as string,
                    visible: row.character_visible as boolean,
                    alive: row.character_alive as boolean
                })))
    }

    public async fetchBySlug({slug, campaignId}: {slug: string, campaignId: number})
    {
        return this.createQueryBuilder('character')
            .where('character.slug=:slug AND character.library_id=:campaignId', {slug, campaignId})
            .getRawOne()
            .then(row => row && ({
                id: row.character_id as number,
                portraitStorageId: row.character_portrait_id as number|null,
                slug: row.character_slug as string|null,
                title: row.character_title as string,
                visible: row.character_visible as boolean,
                alive: row.character_alive as boolean,
                rawbody: row.character_rawbody as string
            }))
    }
}
