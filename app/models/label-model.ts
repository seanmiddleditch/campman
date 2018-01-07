import {Entity, Column, PrimaryGeneratedColumn, Index, EntityRepository, Repository, ManyToMany} from 'typeorm'
import {Note, MediaFile} from '.'
import * as slug from '../util/slug'

@Entity()
export class Label
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    @Index({unique: true})
    public slug: string

    @ManyToMany(t => Note, n => n.labels)
    public notes: Note[]

    @ManyToMany(t => MediaFile, m => m.labels)
    public media: MediaFile[]
}

@EntityRepository(Label)
export class LabelRepository extends Repository<Label>
{
    public fromString(input: string|string[]): string[]
    {
        if (typeof input === 'string')
            input = input.split(/[\s,]+/)
        return input.map(slug.sanitize).filter(s => s.length)
    }

    public reify(slugs: string[]) : Label[]
    {
        return slugs.map(s => {
            const l = new Label()
            l.slug = s
            return l
        })
    }

    public findForLibrary(options: {libraryID: number})
    {
        return this.createQueryBuilder('label')
            .leftJoin('note', 'label.notes', 'note.libraryId=:library', {library: options.libraryID})
            .leftJoin('media', 'label.media', 'media.libraryId=:library', {library: options.libraryID})
            .getMany()
    }

    public findBySlug(options: {slug: string, libraryID: number})
    {
        return this.createQueryBuilder('label')
            .leftJoin('note', 'label.notes', 'note.libraryId=:library', {library: options.libraryID})
            .leftJoin('media', 'label.media', 'media.libraryId=:library', {library: options.libraryID})
            .where('label.slug=:slug', {slug: options.slug})
            .getOne()
    }
}