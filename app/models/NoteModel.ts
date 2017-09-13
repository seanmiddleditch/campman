import LabelModel from './LabelModel';
import LibraryModel from './LibraryModel';
import * as modelsafe from 'modelsafe';
import * as squell from 'squell';

@modelsafe.model({name: 'note'})
@squell.model({indexes: [{name: 'slug', fields: ['libraryId', 'slug']}], timestamps: true})
export default class NoteModel extends modelsafe.Model
{
    @modelsafe.attr(modelsafe.INTEGER, {optional: true})
    @squell.attr({primaryKey: true, autoIncrement: true})
    public id?: number;

    @modelsafe.assoc(modelsafe.BELONGS_TO, () => LibraryModel)
    @squell.assoc({onDelete: 'CASCADE', foreignKey: 'libraryId'})
    public library: LibraryModel;

    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.minLength(1)
    @modelsafe.maxLength(32)
    public slug: string;

    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.maxLength(255)
    @modelsafe.minLength(1)
    public title: string;
    
    @modelsafe.attr(modelsafe.TEXT)
    public body: string;

    @modelsafe.assoc(modelsafe.BELONGS_TO_MANY, () => LabelModel)
    @squell.assoc({through: 'note_label'})
    public labels: LabelModel[];

    public static createWithSlug(slug: string): NoteModel
    {
        const note = new NoteModel;
        note.slug = slug;
        note.title = '';
        note.body = '';
        note.labels = [];
        return note;
    }
}

@modelsafe.model({name: 'note_label'})
@squell.model({timestamps: false})
class NoteLabel extends modelsafe.Model
{
}