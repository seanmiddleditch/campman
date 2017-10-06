import {Database, ASC, attribute} from 'squell'
import {UserModel, LibraryAccessModel, LibraryModel} from '../models'
import {Role} from '../auth'

interface ListLibrariesParams { userID?: number }
interface ListLibrariesResult { libraries: { slug: string, title: string, role: Role, creatorID: number }[] }

export class LibraryController
{
    private _db: Database
    
    constructor(db: Database)
    {
        this._db = db
    }

    async listLibraries({userID}: ListLibrariesParams) : Promise<ListLibrariesResult>
    {
        const libraries = await this._db.query(LibraryModel)
            .attributes(m => [m.slug, m.title])
            .include(UserModel, m => m.creator, q => q.attributes(m => [m.id]))
            .include(LibraryAccessModel, m => [m.acl, {required: false}], q => q.attributes(m => [m.role]).where(m => attribute('userId').eq(userID).or(attribute('userId').eq(null))))
            .order(m => [[m.slug, ASC]])
            .find()
        return {libraries: libraries.map(library => ({
            ...library,
            creatorID: library.creator.id,
            role: library.acl.length ? library.acl[0].role : Role.Visitor
        }))}
    }
}