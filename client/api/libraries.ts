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

    fetchSettings({slug}: {slug: string}) : Promise<{title: string, visibility: 'Public'|'Hidden'}>
    {
        return this._rpc.get<{title: string, visibility: 'Public'|'Hidden'}>('/api/libraries/' + slug + '/settings')
    }

    saveSettings({slug, title, visibility}: {slug: string, title: string, visibility: 'Public'|'Hidden'})
    {
        return this._rpc.post<{}>('/api/libraries/' + slug + '/settings', {title, visibility})
    }
}

export const libraries = new LibrariesAPI()
