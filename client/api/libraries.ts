import {RPCHelper} from './helpers';

export class LibraryData
{
    id?: number;
    slug?: string;
    title?: string;
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

    create({slug, title}: {slug: string, title: string}) : Promise<LibraryData>
    {
        return this._rpc.put<LibraryData>('/api/libraries/' + slug, {title});
    }
};

export const libraries = new LibrariesAPI();