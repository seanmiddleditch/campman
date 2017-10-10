import * as modelsafe from 'modelsafe'
import * as squell from 'squell'
import {NoteModel} from './note-model'
import {UserModel} from './user-model'
import {InviteModel} from './invite-model'
import {Role} from '../auth/access'

export enum LibraryVisibility
{
    Public = 'Public',
    Hidden = 'Hidden'
}

@modelsafe.model({name: 'library'})
export class LibraryModel extends modelsafe.Model
{
    @modelsafe.attr(modelsafe.INTEGER, {optional: true})
    @squell.attr({primaryKey: true, autoIncrement: true})
    public id: number

    @modelsafe.attr(modelsafe.STRING, {unique: true})
    @modelsafe.minLength(1)
    @modelsafe.maxLength(32)
    public slug: string

    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.maxLength(255)
    @modelsafe.minLength(1)
    public title: string

    @modelsafe.attr(modelsafe.ENUM(Object.keys(LibraryVisibility)), {defaultValue: LibraryVisibility.Public})
    public visibility: LibraryVisibility

    @modelsafe.assoc(modelsafe.BELONGS_TO, () => UserModel)
    @squell.assoc({foreignKeyConstraint: true, foreignKey: {allowNull: false}})
    public creator: UserModel

    @modelsafe.assoc(modelsafe.HAS_MANY, () => NoteModel)
    @squell.assoc({})
    public notes: NoteModel[]

    @modelsafe.assoc(modelsafe.HAS_MANY, () => LibraryAccessModel)
    public acl: LibraryAccessModel[]

    @modelsafe.assoc(modelsafe.HAS_MANY, () => InviteModel)
    public invites: InviteModel[]

}

@modelsafe.model({name: 'library_acl'})
@squell.model({indexes: [{name: 'library_acl_user', fields: ['libraryId', 'userId'], unique: true}], timestamps: false})
export class LibraryAccessModel extends modelsafe.Model
{
    @modelsafe.attr(modelsafe.INTEGER, {optional: true})
    @squell.attr({primaryKey: true, autoIncrement: true})
    public id: number

    @modelsafe.assoc(modelsafe.BELONGS_TO, () => LibraryModel)
    @squell.assoc({foreignKeyConstraint: true, foreignKey: {allowNull: false}})
    public library: LibraryModel

    @modelsafe.assoc(modelsafe.BELONGS_TO, () => UserModel)
    @squell.assoc({foreignKeyConstraint: true, foreignKey: {allowNull: true}})
    public user?: UserModel

    @modelsafe.attr(modelsafe.ENUM(['Owner', 'GameMaster', 'Player', 'Visitor']))
    public role: Role
}