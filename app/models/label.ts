import {NoteModel} from './note'
import * as modelsafe from 'modelsafe'
import * as squell from 'squell'

@modelsafe.model({name: 'label'})
export class LabelModel extends modelsafe.Model
{
    @modelsafe.attr(modelsafe.INTEGER, {optional: true})
    @squell.attr({primaryKey: true, autoIncrement: true})
    public id?: number

    @modelsafe.attr(modelsafe.STRING, {unique: true})
    @modelsafe.minLength(1)
    @modelsafe.maxLength(32)
    public slug: string

    @modelsafe.assoc(modelsafe.BELONGS_TO_MANY, () => NoteModel)
    @squell.assoc({through: 'note_label'})
    public notes: NoteModel[]

    public static fromString(input: string|string[]): string[]
    {
        const clean = (s: string) => s.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-/, '').replace(/-$/, '')
        if (typeof input === 'string')
            input = input.split(/[\s,]+/)
        return input.map(clean).filter(s => s.length).map(s => s.substring(0, 32))
    }

    public static async reify(db: squell.Database, slugs: string[]) : Promise<LabelModel[]>
    {
        const results = await db.query(LabelModel)
            .where(l => l.slug.in(slugs))
            .find()

        const missing = []
        for (const slug of slugs)
        {
            if (!results.find(l => l.slug == slug))
            {
                const newLabel = new LabelModel
                newLabel.slug = slug
                missing.push(newLabel)
            }
        }
        const created = await db.query(LabelModel).bulkCreate(missing)

        return results.concat(created)
    }
}