import {Label} from "./label";
import * as modelsafe from "modelsafe";
import * as squell from "squell";

@modelsafe.model({name: 'note'})
export class Note extends modelsafe.Model
{
    @modelsafe.attr(modelsafe.INTEGER, {optional: true})
    @squell.attr({primaryKey: true, autoIncrement: true})
    public id?: number;

    @modelsafe.attr(modelsafe.STRING, {unique: true})
    @modelsafe.minLength(1)
    @modelsafe.maxLength(32)
    public slug: string;

    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.maxLength(255)
    @modelsafe.minLength(1)
    public title: string;
    
    @modelsafe.attr(modelsafe.STRING)
    public body: string;

    @modelsafe.assoc(modelsafe.BELONGS_TO_MANY, Label)
    @squell.assoc({through: 'note_label'})
    public labels: Label[];

    public get labelsString(): string
    {
        return this.labels ? this.labels.map(label => label.slug).join(',') : '';
    }

    public static createWithSlug(slug: string): Note
    {
        const note = new Note;
        note.slug = slug;
        return note;
    }

    public static findBySlug(db: squell.Database, slug: string): Promise<Note|null>
    {
        return db.query(Note).includeAll().where(m => m.slug.eq(slug)).findOne();
    }
}

@modelsafe.model({name: 'note_label'})
class NoteLabel extends modelsafe.Model
{

}