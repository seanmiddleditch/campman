import {Note} from "./note";
import * as modelsafe from "modelsafe";
import * as squell from "squell";

@modelsafe.model({name: 'label'})
export class Label extends modelsafe.Model
{
    @modelsafe.attr(modelsafe.INTEGER, {optional: true})
    @squell.attr({primaryKey: true, autoIncrement: true})
    public id?: number;

    @modelsafe.attr(modelsafe.STRING, {unique: true})
    @modelsafe.minLength(1)
    @modelsafe.maxLength(32)
    public slug: string;

    public static fromString(input: string): string[]
    {
        return input.split(/[\s,]+/).map(
            s => s.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-/, '').replace(/-$/, '')
        ).filter(s => s.length).map(s => s.substring(0, 32));
    }

    public static async reify(db: squell.Database, slugs: string[]) : Promise<Label[]>
    {
        const results = await db.query(Label)
            .where(l => l.slug.in(slugs))
            .find();

        const missing = [];
        for (const slug of slugs)
        {
            if (!results.find(l => l.slug == slug))
            {
                const newLabel = new Label;
                newLabel.slug = slug;
                missing.push(newLabel);
            }
        }
        const created = await db.query(Label).bulkCreate(missing);

        return results.concat(created);
    }
}