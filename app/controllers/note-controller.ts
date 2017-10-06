import {LibraryModel, LabelModel, NoteModel, UserModel} from '../models'
import {Database, ASC, attribute} from 'squell'
import * as slug from '../util/slug'


interface ListNotesParams { libraryID: number }
interface ListNotesResults { notes: { slug: string, title: string, subtitle: string, authorID: number }[] }

interface FetchNoteParams { noteSlug: string, libraryID: number }
interface FetchNoteResults { note?: { slug: string, title: string, subtitle: string, labels: string[], rawbody: Object, authorID: number }}

interface UpdateNoteParams
{
    noteSlug: string,
    libraryID: number
    noteData: {
        title?: string,
        subtitle?: string,
        labels?: string[],
        rawbody?: Object
    }
}
interface UpdateNoteResults {}

interface DeleteNoteParams { noteSlug: string, libraryID: number }
interface DeleteNoteResults { deleted: number }

export class NoteController
{
    private _db: Database

    constructor(db: Database)
    {
        this._db = db
    }

    async listNotes({libraryID}: ListNotesParams) : Promise<ListNotesResults>
    {
        // has to be a cleaner way to write this
        const query = await this._db.query(NoteModel)
                .attributes(m => [m.slug, m.title, m.subtitle, attribute('userId')])
                .include(LabelModel, m => [m.labels, {required: false}], q => q.attributes(m => [m.slug]))
                .where(m => attribute('libraryId').eq(libraryID))
                .order(m => [[m.title, ASC]])
            
        const notes = await query.find()

        return {notes: notes.map(note => ({...note, authorID: (note as any).creatorId as number, labels: note.labels.map(label => label.slug)}))}
    }

    async fetchNote({noteSlug, libraryID}: FetchNoteParams) : Promise<FetchNoteResults>
    {
        const note = await this._db.query(NoteModel)
            .attributes(m => [m.slug, m.title, m.subtitle, m.rawbody, attribute('userId')])
            .include(LabelModel, m => [m.labels, {required: false}], q => q.attributes(m => [m.slug]))
            .where(m => attribute('libraryId').eq(libraryID))
            .where(m => m.slug.eq(noteSlug)).findOne()

        return {
            note: note ? {
                slug: noteSlug,
                title: note.title,
                subtitle: note.subtitle,
                rawbody: note.rawbody ? JSON.parse(note.rawbody) : null,
                labels: note.labels.map(label => label.slug),
                authorID: (note as any).creatorId as number
            } : undefined
        }
    }

    async updateNote({noteSlug, noteData, libraryID}: UpdateNoteParams) : Promise<UpdateNoteResults>
    {
        if (!slug.isValid(noteSlug))
            throw new Error('Invalid slug')

        let note = await this._db.query(NoteModel)
            .include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.id.eq(libraryID)))
            .include(LabelModel, m => [m.labels, {required: false}])
            .where(m => m.slug.eq(noteSlug)).findOne()

        if (!note)
            note = new NoteModel()

        note.slug = noteSlug
        note.title = noteData.title || note.title || ''
        note.subtitle = noteData.subtitle || note.subtitle || ''
        note.rawbody = noteData.rawbody ? JSON.stringify(noteData.rawbody) : note.rawbody || ''
        note.labels = noteData.labels ? await LabelModel.reify(this._db, noteData.labels) : note.labels

        if (!note.library)
            note.library = await this._db.query(LibraryModel).where(m => m.id.eq(libraryID)).findOne()

        await this._db.query(NoteModel).includeAll().save(note)

        return {}
    }

    async deleteNote({noteSlug, libraryID}: DeleteNoteParams) : Promise<DeleteNoteResults>
    {
        const count = await this._db
            .query(NoteModel)
            .where(m => m.slug.eq(noteSlug))
            .include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.id.eq(libraryID)))
            .destroy()
        return {deleted: count}
    }
}
