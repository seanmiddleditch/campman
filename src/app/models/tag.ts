import {Entity, Column, PrimaryGeneratedColumn, Index, EntityRepository, Repository, ManyToMany} from 'typeorm'
import {PageModel, MediaModel} from '.'
import * as slug from '../../common/slug-utils'

@Entity({name: 'label'})
export class TagModel
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    @Index({unique: true})
    public slug: string

    // @ManyToMany(t => PageModel, m => m.tags)
    // public pages: PageModel[]

    // @ManyToMany(t => MediaModel, m => m.tags)
    // public media: MediaModel[]
}

@EntityRepository(TagModel)
export class TagRepository extends Repository<TagModel>
{
    public fromString(input: string|string[]): string[]
    {
        if (typeof input === 'string')
            input = input.split(/[\s,]+/)
        return input.map(slug.sanitize).filter(s => s.length)
    }

    public reify(slugs: string[]) : TagModel[]
    {
        return slugs.map(s => {
            const l = new TagModel()
            l.slug = s
            return l
        })
    }

    public findForCampaign({campaignId}: {campaignId: number})
    {
        return this.createQueryBuilder('label')
            //.leftJoin('label.pages', 'pages', 'pages.library_id=:campaignId', {campaignId})
            //.leftJoin('media', 'media', 'media.library_id=:campaignId', {campaignId})
            .getMany()
    }

    public findBySlug({campaignId, slug}: {slug: string, campaignId: number})
    {
        return this.createQueryBuilder('label')
            //.leftJoin('label.pages', 'pages', 'pages.library_id=:campaignId', {campaignId})
            //.leftJoin('media', 'media', 'media.library_id=:campaignId', {campaignId})
            .where('label.slug=:slug', {slug})
            .getOne()
    }
}