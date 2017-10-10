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
        return this._rpc.put<Library>(`/api/libraries/${slug}`, {title});
    }

    fetchSettings({slug}: {slug: string}) : Promise<{title: string, visibility: 'Public'|'Hidden'}>
    {
        return this._rpc.get<{title: string, visibility: 'Public'|'Hidden', members: {id: number, role: string, nickname: string}[]}>('/api/libraries/' + slug + '/settings')
    }

    saveSettings({slug, title, visibility}: {slug: string, title: string, visibility: 'Public'|'Hidden'})
    {
        return this._rpc.post<{}>(`/api/libraries/${slug}/settings`, {title, visibility})
    }

    updateMemberRole({slug, userID, role}: {slug: string, userID: number, role: 'GameMaster'|'Player'|'Visitor'})
    {
        return this._rpc.post<{}>(`/api/libraries/${slug}/members/${userID}`, {role})
    }

    inviteMember({slug, email}: {slug: string, email: string})
    {
        return this._rpc.post<{}>(`/api/libraries/${slug}/members/invite`, {email})
    }

    acceptInvite({code}: {code: string})
    {
        return this._rpc.post<{}>(`/api/invitation/accept/${code}`)
    }
}

export const libraries = new LibrariesAPI()
