import LibraryModel from '../models/library';

declare global
{
    namespace Express
    {
        export interface Request
        {
            library?: LibraryModel
        }
    }
}