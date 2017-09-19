import {RPCHelper} from './helpers';

export class LibraryData
{
    id?: number;
    slug?: string;
};

export class LibrariesAPI
{
    private _rpc = new RPCHelper();

    fetchAll() : Promise<LibraryData[]>
    {
        return this._rpc.get<LibraryData[]>('/api/libraries');
    }

    fetch(slug: string) : Promise<LibraryData>
    {
        return this._rpc.get<LibraryData>('/api/libraries/' + slug);
    }
};

export const libraries = new LibrariesAPI();