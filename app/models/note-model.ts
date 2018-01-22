import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn, Index, EntityRepository, Repository} from 'typeorm'
import {LabelModel} from './label-model'
import {LibraryModel} from './library-model'
import {AccountModel} from './account-model'
import {Role} from '../auth'

export enum NoteVisibility
{
    Public = 'Public',
    Hidden = 'Hidden'
}

@Entity({name: 'note'})
@Index(['libraryId', 'slug'])
export class NoteModel
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column({name: 'library_id'})
    public libraryId: number

    @ManyToOne(t => LibraryModel, l => l.notes)
    @JoinColumn({name: 'library_id'})
    public library: LibraryModel

    @Column({name: 'author_id'})
    public authorId: number

    @ManyToOne(t => AccountModel)
    @JoinColumn({name: 'author_id'})
    public author: AccountModel

    @Column()
    public slug: string

    @Column({default: NoteVisibility.Public})
    public visibility: NoteVisibility

    @Column()
    public title: string

    @Column({type: 'text', default: ''})
    public rawbody: string

    @ManyToMany(t => LabelModel)
    @JoinTable({name: 'note_labels', joinColumn: {name: 'label_id'}, inverseJoinColumn: {name: 'note_id'}})
    public labels: LabelModel[]
}

@EntityRepository(NoteModel)
export class NoteRepository extends Repository<NoteModel>
{
    public async findNotesForLibrary({libraryID}: {libraryID: number})
    {
        return this.createQueryBuilder('note')
            .where('"library_id"=:libraryID', {libraryID})
            .getRawMany()
            .then(results => results.map(row => ({
                    id: row.note_id as number,
                    slug: row.note_slug as string,
                    title: row.note_title as string,
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
                rawbody: row.note_rawbody as string,
                visibility: row.note_visibility as NoteVisibility,
                authorID: row.note_authorId as number,
                labels: row.label_slug as string
            }))
    }

    public async updateNote(options: {slug: string, libraryID: number, title?: string, rawbody?: string, visibility?: NoteVisibility, labels?: string[]})
    {
        const {slug, libraryID, title, rawbody, visibility} = options
        await this.createQueryBuilder('note')
            .update({
                title,
                rawbody,
                visibility
            })
            .where('"slug"=:slug AND "library_id"=:libraryID', {slug, libraryID})
            .execute()
        
        //labels: req.body['labels'],
    }

    public async createNote(options: {slug: string, authorID: number, libraryID: number, title?: string, rawbody?: string, visibility?: NoteVisibility, labels?: string[]})
    {
        const {slug, authorID, libraryID, title, rawbody, visibility} = options
        const note = await this.create({
            libraryId: libraryID,
            authorId: authorID,
            slug,
            title,
            rawbody,
            visibility
        })
        await this.save(note)
        return note
        
        //labels: req.body['labels'],
    }
}
