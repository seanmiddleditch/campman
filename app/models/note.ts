import * as typeorm from "typeorm";

@typeorm.Entity()
export class Label
{
    @typeorm.PrimaryGeneratedColumn()
    public id: number;

    @typeorm.Column({length: 32})
    @typeorm.Column({length: 32})
    @typeorm.Index({unique: true})
    public slug: string;

    @typeorm.ManyToMany(type => Note, note => note.labels, {
        cascadeInsert: false,
        cascadeUpdate: false
    })
    public notes: Note[];

    public constructor(label: string)
    {
        this.slug = label;
    }

    public static fromString(input: string): string[]
    {
        return input.split(/[\s,]+/).filter(s => s.length);
    }

    public static reify(connection: typeorm.Connection, labels: string[]) : Promise<Label[]>
    {
        const repo = connection.getRepository(Label);

        // typeorm can't handle this efficiently just yet...
        return Promise.all(labels.map(async (slug) => {
            const label = await repo.findOne({slug: slug});
            return label ? label : new Label(slug);
        }));
    }
}

@typeorm.Entity()
export class Note
{
    @typeorm.PrimaryGeneratedColumn({"type": "int"})
    public id: number;

    @typeorm.Column({length: 32})
    @typeorm.Index({unique: true})
    public tag: string;

    @typeorm.Column()
    public title: string;
    
    @typeorm.Column()
    public body: string;

    @typeorm.VersionColumn()
    public revision: number;

    @typeorm.CreateDateColumn()
    public created: Date;

    @typeorm.UpdateDateColumn()
    public updated: Date;

    @typeorm.ManyToMany(type => Label, label => label.notes, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    @typeorm.JoinTable()
    public labels: Label[];

    public get labelsString(): string
    {
        return this.labels ? this.labels.map(label => label.slug).join(',') : '';
    }
}