import * as modelsafe from 'modelsafe'
import * as squell from 'squell'
import {NoteModel} from './note-model'
import {UserModel} from './user'
import {Role} from '../auth/access'

@modelsafe.model({name: 'library'})
export class LibraryModel extends modelsafe.Model
{
    @modelsafe.attr(modelsafe.INTEGER, {optional: true})
    @squell.attr({primaryKey: true, autoIncrement: true})
    public id?: number

    @modelsafe.attr(modelsafe.STRING, {unique: true})
    @modelsafe.minLength(1)
    @modelsafe.maxLength(32)
    public slug: string

    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.maxLength(255)
    @modelsafe.minLength(1)
    public title: string

    @modelsafe.assoc(modelsafe.BELONGS_TO, () => UserModel)
    @squell.assoc({foreignKeyConstraint: true, foreignKey: {allowNull: false}})
    public creator: UserModel

    @modelsafe.assoc(modelsafe.HAS_MANY, () => NoteModel)
    @squell.assoc({})
    public notes: NoteModel[]

    @modelsafe.assoc(modelsafe.HAS_MANY, () => LibraryAccessModel)
    public acl: LibraryAccessModel[]

    public static findBySlug(db: squell.Database, slug: string): Promise<LibraryModel|null>
    {
        return db.query(LibraryModel).includeAll().where(m => m.slug.eq(slug)).findOne()
    }

    public static async queryAccess(db: squell.Database, librarySlug: string, userID: number): Promise<[LibraryModel|null, Role]>
    {
         const rs = await db.query(LibraryAccessModel)
            .attributes(m => [m.role])
            .include(LibraryModel, m => m.library, q => q.where(m => m.slug.eq(librarySlug)))
            .where(m => squell.attribute('userId').eq(userID).or(squell.attribute('userId').eq(null)))
            .order(m => [[m.role, squell.DESC]])
            .findOne()
        return rs ? [rs.library, rs.role || Role.Visitor] : [null, Role.Visitor]
    }
}

@modelsafe.model({name: 'library_acl'})
@squell.model({indexes: [{name: 'library_acl_user', fields: ['libraryId', 'userId'], unique: true}], timestamps: false})
export class LibraryAccessModel extends modelsafe.Model
{
    @modelsafe.assoc(modelsafe.BELONGS_TO, () => LibraryModel)
    @squell.assoc({foreignKeyConstraint: true, foreignKey: {allowNull: false}})
    public library: LibraryModel

    @modelsafe.assoc(modelsafe.BELONGS_TO, () => UserModel)
    @squell.assoc({foreignKeyConstraint: true, foreignKey: {allowNull: true}})
    public user?: UserModel

    @modelsafe.attr(modelsafe.ENUM(['Owner', 'GameMaster', 'Player', 'Visitor']))
    public role: Role
}