import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn, Index, EntityRepository, Repository} from 'typeorm'
import {TagModel} from './tag'
import {CampaignModel} from './campaign'
import {ProfileModel} from './profile'
import {CampaignRole} from '../auth'

export enum PageVisibility
{
    Public = 'Public',
    Hidden = 'Hidden'
}

@Entity({name: 'note'})
@Index(['campaignId', 'slug'])
export class PageModel
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column({name: 'library_id'})
    public campaignId: number

    @ManyToOne(t => CampaignModel, l => l.pages)
    @JoinColumn({name: 'library_id'})
    public campaign: CampaignModel

    @Column({name: 'author_id'})
    public authorId: number

    @ManyToOne(t => ProfileModel)
    @JoinColumn({name: 'author_id'})
    public author: ProfileModel

    @Column()
    public slug: string

    @Column({default: PageVisibility.Public})
    public visibility: PageVisibility

    @Column()
    public title: string

    @Column({type: 'text', default: ''})
    public rawbody: string

    @ManyToMany(t => TagModel)
    @JoinTable({name: 'note_labels', joinColumn: {name: 'label_id'}, inverseJoinColumn: {name: 'note_id'}})
    public tags: TagModel[]
}

@EntityRepository(PageModel)
export class PageRepository extends Repository<PageModel>
{
    public async findForCampaign({campaignId}: {campaignId: number})
    {
        return this.createQueryBuilder('note')
            .where('"library_id"=:campaignId', {campaignId})
            .getRawMany()
            .then(results => results.map(row => ({
                    id: row.note_id as number,
                    slug: row.note_slug as string,
                    title: row.note_title as string,
                    visibility: row.note_visibility as PageVisibility,
                    authorID: row.note_authorId as number
                })))
    }

    public async fetchBySlug({slug, campaignId}: {slug: string, campaignId: number})
    {
        return this.createQueryBuilder('note')
            .where('note."slug"=:slug AND "library_id"=:campaignId', {slug, campaignId})
            .leftJoinAndSelect('note.tags', 'tag')
            .getRawOne()
            .then(row => row && ({
                id: row.note_id as number,
                slug: row.note_slug as string,
                title: row.note_title as string,
                rawbody: row.note_rawbody as string,
                visibility: row.note_visibility as PageVisibility,
                authorID: row.note_authorId as number,
                tags: row.tag_slug as string
            }))
    }

    public async updatePage(options: {slug: string, campaignId: number, title?: string, rawbody?: string, visibility?: PageVisibility, labels?: string[]})
    {
        const {slug, campaignId, title, rawbody, visibility} = options
        await this.createQueryBuilder('note')
            .update({
                title,
                rawbody,
                visibility
            })
            .where('"slug"=:slug AND "library_id"=:campaignId', {slug, campaignId})
            .execute()
        
        //labels: req.body['labels'],
    }

    public async createPage(options: {slug: string, authorID: number, campaignId: number, title?: string, rawbody?: string, visibility?: PageVisibility, labels?: string[]})
    {
        const {slug, authorID, campaignId, title, rawbody, visibility} = options
        const page = await this.create({
            campaignId: campaignId,
            authorId: authorID,
            slug,
            title,
            rawbody,
            visibility
        })
        await this.save(page)
        return page
        
        //labels: req.body['labels'],
    }
}
