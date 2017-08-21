import * as typeorm from "typeorm";

@typeorm.Entity()
export class Label
{
    @typeorm.PrimaryGeneratedColumn()
    public id: number;

    @typeorm.Column({length: 32})
    @typeorm.Index({unique: true})
    public slug: string;

    public constructor(label: string) {
        this.slug = label;
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

    @typeorm.ManyToMany(type => Label, {
        cascadeInsert: true,
        cascadeUpdate: false
    })
    @typeorm.JoinTable()
    public labels: Label[];

    public setLabelString(labelsText: string) {
        const labels = labelsText.split(/[\s,]+/);
        this.labels = labels.map(s => new Label(s));
    }

    public get labelsString(): string
    {
        return this.labels ? this.labels.map(label => label.slug).join(',') : '';
    }
}