import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, Index, EntityRepository, Repository} from 'typeorm'
import {Label} from './label-model'
import {Library} from './library-model'
import {User} from './user-model'
import {Role} from '../auth'

export enum NoteVisibility
{
    Public = 'Public',
    Hidden = 'Hidden'
}

@Entity()
@Index(['libraryId', 'slug'])
export class Note
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    public libraryId: number

    @ManyToOne(t => Library, l => l.notes)
    @JoinTable()
    public library: Library

    @Column()
    public authorId: number

    @ManyToOne(t => User)
    @JoinTable()
    public author: User

    @Column()
    public slug: string

    @Column({default: 'page'})
    public type: string

    @Column({default: NoteVisibility.Public})
    public visibility: NoteVisibility

    @Column()
    public title: string
    
    @Column({default: ''})
    public subtitle: string

    @Column({type: 'text', default: ''})
    public rawbody: string

    @ManyToMany(t => Label)
    @JoinTable()
    public labels: Label[]
}

@EntityRepository(Note)
export class NoteRepository extends Repository<Note>
{
    public async listNotes({libraryID}: {libraryID: number})
    {
        return this.createQueryBuilder('note')
            .where('"libraryId"=:libraryID', {libraryID})
            .getRawMany()
            .then(results => results.map(row => ({
                    id: row.note_id as number,
                    type: row.note_type as string,
                    slug: row.note_slug as string,
                    title: row.note_title as string,
                    subtitle: row.note_subtitle as string,
                    visibility: row.note_visibility as NoteVisibility,
                    authorID: row.note_authorId as number
                })))
    }

    public async fetchBySlug({slug, libraryID}: {slug: string, libraryID: number})
    {
        return this.createQueryBuilder('note')
            .where('note."slug"=:slug AND "libraryId"=:libraryID', {slug, libraryID})
            .leftJoinAndSelect('note.labels', 'label')
            .getRawOne()
            .then(row => ({
                id: row.note_id as number,
                type: row.note_type as string,
                slug: row.note_slug as string,
                title: row.note_title as string,
                subtitle: row.note_subtitle as string,
                rawbody: row.note_rawbody as string,
                visibility: row.note_visibility as NoteVisibility,
                authorID: row.note_authorId as number,
                labels: row.label_slug as string
            }))
    }

    public async updateNote(options: {slug: string, libraryID: number, title?: string, subtitle?: string, rawbody?: string, visibility?: NoteVisibility, labels?: string[]})
    {
        const {slug, libraryID, title, subtitle, rawbody, visibility} = options
        await this.createQueryBuilder('note')
            .update({
                title,
                subtitle,
                rawbody,
                visibility
            })
            .where('"slug"=:slug AND "libraryId"=:libraryID', {slug, libraryID})
            .execute()
        
        //labels: req.body['labels'],
    }
}
