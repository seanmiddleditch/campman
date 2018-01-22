import {Entity, Column, PrimaryGeneratedColumn, Index, EntityRepository, Repository, ManyToMany} from 'typeorm'
import {NoteModel, MediaModel} from '.'
import * as slug from '../util/slug-utils'

@Entity({name: 'label'})
export class LabelModel
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    @Index({unique: true})
    public slug: string

    // @ManyToMany(t => MediaModel, m => m.labels)
    // public media: MediaModel[]
}

@EntityRepository(LabelModel)
export class LabelRepository extends Repository<LabelModel>
{
    public fromString(input: string|string[]): string[]
    {
        if (typeof input === 'string')
            input = input.split(/[\s,]+/)
        return input.map(slug.sanitize).filter(s => s.length)
    }

    public reify(slugs: string[]) : LabelModel[]
    {
        return slugs.map(s => {
            const l = new LabelModel()
            l.slug = s
            return l
        })
    }

    public findForLibrary(options: {libraryID: number})
    {
        return this.createQueryBuilder('label')
            .leftJoin('note', 'label.notes', '"label.notes".library_id=:library', {library: options.libraryID})
            .leftJoin('media', 'label.media', '"label.media".library_id=:library', {library: options.libraryID})
            .getMany()
    }

    public findBySlug(options: {slug: string, libraryID: number})
    {
        return this.createQueryBuilder('label')
            .leftJoin('note', 'label.notes', '"label.notes".library_id=:library', {library: options.libraryID})
            .leftJoin('media', 'label.media', '"label.media".library_id=:library', {library: options.libraryID})
            .where('label.slug=:slug', {slug: options.slug})
            .getOne()
    }
}