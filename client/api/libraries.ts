import {RPCHelper} from './helpers'
import {Library} from '../types'

export class LibrariesAPI
{
    private _rpc = new RPCHelper();

    fetchAll() : Promise<Library[]>
    {
        return this._rpc.get<Library[]>('/api/libraries');
    }

    fetch(slug: string) : Promise<Library>
    {
        return this._rpc.get<Library>('/api/libraries/' + slug);
    }

    create({slug, title}: {slug: string, title: string}) : Promise<Library>
    {
        return this._rpc.put<Library>('/api/libraries/' + slug, {title});
    }
}

export const libraries = new LibrariesAPI()
