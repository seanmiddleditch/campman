import * as modelsafe from "modelsafe";
import * as squell from "squell";

@modelsafe.model({name: 'library'})
export class Library extends modelsafe.Model
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

    public static findBySlug(db: squell.Database, slug: string): Promise<Library|null>
    {
        return db.query(Library).includeAll().where(m => m.slug.eq(slug)).findOne();
    }
}