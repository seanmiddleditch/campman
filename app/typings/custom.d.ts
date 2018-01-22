import {LibraryModel} from '../models/library-model'
import {Role} from '../auth/access'

declare global
{
    namespace Express
    {
        export interface Request
        {
            domainSlug: string
            library?: LibraryModel
            libraryID: number
            userID: number
            userRole: Role
        }
    }
}