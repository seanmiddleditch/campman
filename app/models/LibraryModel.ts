import * as modelsafe from 'modelsafe';
import * as squell from 'squell';
import NoteModel from './NoteModel';

@modelsafe.model({name: 'library'})
@squell.model({timestamps: true})
export default class LibraryModel extends modelsafe.Model
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

    @modelsafe.assoc(modelsafe.HAS_MANY, () => NoteModel)
    public notes: NoteModel[];

    public static findBySlug(db: squell.Database, slug: string): Promise<LibraryModel|null>
    {
        return db.query(LibraryModel).includeAll().where(m => m.slug.eq(slug)).findOne();
    }
}