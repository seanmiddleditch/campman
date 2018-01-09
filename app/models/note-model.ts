import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn, Index, EntityRepository, Repository} from 'typeorm'
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

    @Column({name: 'library_id'})
    public libraryId: number

    @ManyToOne(t => Library, l => l.notes)
    @JoinColumn({name: 'library_id'})
    public library: Library

    @Column({name: 'author_id'})
    public authorId: number

    @ManyToOne(t => User)
    @JoinColumn({name: 'author_id'})
    public author: User

    @Column()
    public slug: string

    @Column({default: NoteVisibility.Public})
    public visibility: NoteVisibility

    @Column()
    public title: string
    
    @Column({default: ''})
    public subtitle: string

    @Column({type: 'text', default: ''})
    public rawbody: string

    @ManyToMany(t => Label)
    @JoinTable({name: 'note_labels', joinColumn: {name: 'label_id'}, inverseJoinColumn: {name: 'note_id'}})
    public labels: Label[]
}

@EntityRepository(Note)
export class NoteRepository extends Repository<Note>
{
    public async listNotes({libraryID}: {libraryID: number})
    {
        return this.createQueryBuilder('note')
            .where('"library_id"=:libraryID', {libraryID})
            .getRawMany()
            .then(results => results.map(row => ({
                    id: row.note_id as number,
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
            .where('note."slug"=:slug AND "library_id"=:libraryID', {slug, libraryID})
            .leftJoinAndSelect('note.labels', 'label')
            .getRawOne()
            .then(row => row && ({
                id: row.note_id as number,
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
            .where('"slug"=:slug AND "library_id"=:libraryID', {slug, libraryID})
            .execute()
        
        //labels: req.body['labels'],
    }

    public async createNote(options: {slug: string, authorID: number, libraryID: number, title?: string, subtitle?: string, rawbody?: string, visibility?: NoteVisibility, labels?: string[]})
    {
        const {slug, authorID, libraryID, title, subtitle, rawbody, visibility} = options
        const note = await this.create({
            libraryId: libraryID,
            authorId: authorID,
            slug,
            title,
            subtitle,
            rawbody,
            visibility
        })
        await this.save(note)
        return note
        
        //labels: req.body['labels'],
    }
}
