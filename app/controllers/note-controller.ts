import {LibraryModel, LabelModel, NoteModel, UserModel} from '../models'
import {Database, ASC, attribute} from 'squell'
import * as slug from '../util/slug'

interface ListNotesParams { librarySlug: string }
interface ListNotesResults { notes: { slug: string, title: string, subtitle: string }[] }

interface FetchNoteParams { noteSlug: string, librarySlug: string }
interface FetchNoteResults { slug: string, title: string, subtitle: string, labels: string[], rawbody: Object }

interface UpdateNoteParams
{
    noteSlug: string,
    librarySlug: string
    noteData: {
        title?: string,
        subtitle?: string,
        labels?: string[],
        rawbody?: Object
    }
}
interface UpdateNoteResults {}

interface DeleteNoteParams { noteSlug: string, librarySlug: string }
interface DeleteNoteResults { deleted: number }

export class NoteController
{
    private _db: Database

    constructor(db: Database)
    {
        this._db = db
    }

    async listNotes({librarySlug}: ListNotesParams) : Promise<ListNotesResults>
    {
        // has to be a cleaner way to write this
        const query = await this._db.query(NoteModel)
                .attributes(m => [m.slug, m.title, m.subtitle])
                .include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.slug.eq(librarySlug)))
                .include(LabelModel, m => [m.labels, {required: false}], q => q.attributes(m => [m.slug]))
                .order(m => [[m.title, ASC]])
            
        const notes = await query.find()

        return {notes: notes.map(note => ({... note, labels: note.labels.map(label => label.slug)}))}
    }

    async fetchNote({noteSlug, librarySlug}: FetchNoteParams) : Promise<FetchNoteResults>
    {
        const note = await this._db.query(NoteModel)
            .attributes(m => [m.slug, m.title, m.subtitle, m.rawbody])
            .include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.slug.eq(librarySlug)))
            .include(LabelModel, m => [m.labels, {required: false}], q => q.attributes(m => [m.slug]))
            .where(m => m.slug.eq(noteSlug)).findOne()

        return {
            slug: note.slug,
            title: note.title,
            subtitle: note.subtitle,
            rawbody: JSON.parse(note.rawbody),
            labels: note.labels.map(label => label.slug)
        }
    }

    async updateNote({noteSlug, noteData, librarySlug}: UpdateNoteParams) : Promise<UpdateNoteResults>
    {
        if (!slug.isValid(noteSlug))
            throw new Error('Invalid slug')

        const originalNote = await this._db.query(NoteModel)
            .attributes(m => [m.id])
            .include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.slug.eq(librarySlug)))
            .where(m => m.slug.eq(noteSlug)).findOne()

        const updatedNote = await this._db.query(NoteModel)
            .includeAll()
            .upsert({
                id: originalNote.id,
                slug: slug.sanitize(noteSlug),
                title: noteData.title,
                subtitle: noteData.subtitle,
                rawbody: JSON.stringify(noteData.rawbody),
                labels: noteData.labels ? await LabelModel.reify(this._db, noteData.labels) : undefined
            })

        return {}
    }

    async deleteNote({noteSlug, librarySlug}: DeleteNoteParams) : Promise<DeleteNoteResults>
    {
        const count = await this._db
            .query(NoteModel)
            .where(m => m.slug.eq(noteSlug))
            .include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.slug.eq(librarySlug)))
            .destroy()
        return {deleted: count}
    }
}
