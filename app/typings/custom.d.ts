import {LibraryModel} from '../models/library'
import {Access} from '../auth/access'

declare global
{
    namespace Express
    {
        export interface Request
        {
            library?: LibraryModel
            accessLevel?: Access
        }
    }
}