import LabelModel from './label';
import LibraryModel from './library';
import * as modelsafe from 'modelsafe';
import * as squell from 'squell';

@modelsafe.model({name: 'note'})
@squell.model({indexes: [{name: 'library_note_unique_slug', fields: ['libraryId', 'slug'], unique: true}], timestamps: true})
export default class NoteModel extends modelsafe.Model
{
    @modelsafe.attr(modelsafe.INTEGER, {optional: true})
    @squell.attr({primaryKey: true, autoIncrement: true})
    public id?: number;

    @modelsafe.assoc(modelsafe.BELONGS_TO, () => LibraryModel)
    @squell.assoc({onDelete: 'CASCADE', foreignKey: {name: 'libraryId', allowNull: false}, foreignKeyConstraint: true})
    public library: LibraryModel;

    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.minLength(1)
    @modelsafe.maxLength(32)
    public slug: string;

    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.maxLength(255)
    @modelsafe.minLength(1)
    public title: string;
    
    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.maxLength(255)
    @modelsafe.minLength(0)
    public subtitle: string;

    @modelsafe.attr(modelsafe.TEXT)
    public rawbody: string;

    @modelsafe.assoc(modelsafe.BELONGS_TO_MANY, () => LabelModel)
    @squell.assoc({through: 'note_label'})
    public labels: LabelModel[] = [];
}

@modelsafe.model({name: 'note_label'})
@squell.model({timestamps: false})
class NoteLabel extends modelsafe.Model
{
}