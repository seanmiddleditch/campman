import {Library} from '../models/library-model'
import {Role} from '../auth/access'

declare global
{
    namespace Express
    {
        export interface Request
        {
            domainSlug: string
            library?: Library
            libraryID: number
            userID: number
            userRole: Role
        }
    }
}