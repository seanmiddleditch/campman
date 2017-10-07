import {LabelModel} from './label-model'
import {LibraryModel} from './library-model'
import {UserModel} from './user-model'
import * as modelsafe from 'modelsafe'
import * as squell from 'squell'

export enum NoteVisibility
{
    Public = 'Public',
    Hidden = 'Hidden'
}

@modelsafe.model({name: 'note'})
@squell.model({indexes: [{name: 'library_note_unique_slug', fields: ['libraryId', 'slug'], unique: true}], timestamps: true})
export class NoteModel extends modelsafe.Model
{
    @modelsafe.attr(modelsafe.INTEGER, {optional: true})
    @squell.attr({primaryKey: true, autoIncrement: true})
    public id: number

    @modelsafe.assoc(modelsafe.BELONGS_TO, () => LibraryModel)
    @squell.assoc({onDelete: 'CASCADE', foreignKey: {name: 'libraryId', allowNull: false}, foreignKeyConstraint: true})
    public library: LibraryModel

    @modelsafe.assoc(modelsafe.BELONGS_TO, () => UserModel)
    @squell.assoc({onDelete: 'SET NULL', foreignKey: {name: 'userId', allowNull: true}, foreignKeyConstraint: true})
    public author: UserModel

    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.minLength(1)
    @modelsafe.maxLength(32)
    public slug: string

    @modelsafe.attr(modelsafe.STRING, {defaultValue: 'page'})
    public type: string

    @modelsafe.attr(modelsafe.ENUM(Object.keys(NoteVisibility)), {defaultValue: NoteVisibility.Hidden})
    public visibility: NoteVisibility

    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.maxLength(255)
    @modelsafe.minLength(1)
    public title: string
    
    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.maxLength(255)
    @modelsafe.minLength(0)
    public subtitle: string

    @modelsafe.attr(modelsafe.TEXT)
    public rawbody: string

    @modelsafe.assoc(modelsafe.BELONGS_TO_MANY, () => LabelModel)
    @squell.assoc({through: 'note_label'})
    public labels: LabelModel[]
}

@modelsafe.model({name: 'note_label'})
@squell.model({timestamps: false})
class NoteLabel extends modelsafe.Model
{
}