import {Database, ASC, attribute} from 'squell'
import {LabelModel, NoteModel, LibraryModel} from '../models'

interface ListLabelsParams { librarySlug: string }
interface ListLabelsResult { labels: { slug: string, numNotes: number }[] }

interface FetchLabelParams { labelSlug: string, librarySlug: string }
interface FetchLabelResult { label: { slug: string }, notes: { slug: string, title: string }[] }

export class LabelController
{
    private _db: Database
    
    constructor(db: Database)
    {
        this._db = db
    }

    async listLabels({librarySlug}: ListLabelsParams) : Promise<ListLabelsResult>
    {
        const labels = await this._db.query(LabelModel)
                .attributes(m => [m.slug])
                .include(NoteModel, m => m.notes, q => q.attributes(m => [m.id]).include(LibraryModel, m => m.library, q => q.attributes(m => []).where(m => m.slug.eq(librarySlug))))
                .order(m => [[m.slug, ASC]])
                .find()

        return {
            labels: labels.map(label => ({slug: label.slug, numNotes: label.notes.length}))
        }
    }

    async fetchLabel({labelSlug, librarySlug}: FetchLabelParams) : Promise<FetchLabelResult>
    {
        const [label, notes] = await Promise.all([
            this._db.query(LabelModel)
                .attributes(m => [m.slug])
                .where(m => m.slug.eq(labelSlug))
                .findOne(),
            this._db.query(NoteModel)
                .attributes(m => [m.slug, m.title])
                .include(LibraryModel, m => m.library, q => q.where(m => m.slug.eq(librarySlug)))
                .include(LabelModel, m => m.labels, q => q.where(m => m.slug.eq(labelSlug)))
                .find()
        ])

        return {
            label: {slug: label.slug},
            notes: notes.map(note => ({slug: note.slug, title: note.title}))
        }
    }
}