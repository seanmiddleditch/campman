import User from './User';

interface RetrieveLabelsResponseLabel
{
    slug: string,
    notes: number
};
export type RetrieveLabelsResponse = RetrieveLabelsResponseLabel[];

export interface RetrieveLabelResponse
{
    slug: string,
    notes: {
        slug: string,
        title: string
    }[]
};

interface RetrieveNotesResponseNote
{
    slug: string,
    title: string,
    labels: string[]
}
export type RetrieveNotesResponse = RetrieveNotesResponseNote[];

export interface RetrieveNoteResponse
{
    slug: string,
    title: string,
    body: string,
    labels: string[]
};

export interface RetrieveSessionResponse
{
    googleClientID: string;
    sessionKey: string;
    user?: User;
};

export class APIError extends Error
{
    public readonly status?: number;

    constructor(error: string, status?: number)
    {
        super(error);
        this.status = status;
    }
}

export default class ClientGateway
{
    private rootURL: string;

    constructor(rootURL?: string)
    {
        this.rootURL = rootURL || (() => {
            const loc = window.location;
            return `${loc.protocol}//${loc.host}`;
        })();
    }

    retrieveLabels(libraryID?: number) : Promise<RetrieveLabelsResponse>
    {
        return this._rpcHelper<RetrieveLabelsResponse>('/api/labels/list', {library: libraryID});
    }

    retrieveLabel(slug: string, libraryID?: number) : Promise<RetrieveLabelResponse>
    {
        return this._rpcHelper<RetrieveLabelResponse>('/api/labels/get', {slug, library: libraryID});
    }

    retrieveNote(slug: string, libraryID?: number) : Promise<RetrieveNoteResponse>
    {
        return this._rpcHelper<RetrieveNoteResponse>('/api/notes/get', {slug, library: libraryID});
    }

    retrieveNotes(libraryID?: number) : Promise<RetrieveNotesResponse>
    {
        return this._rpcHelper<RetrieveNotesResponse>('/api/notes/list', {library: libraryID});
    }

    deleteNote(slug: string, libraryID?: number) : Promise<void>
    {
        return this._rpcHelper('/api/notes/delete', {library: libraryID}, 'DELETE', {slug});
    }

    saveNote(note: {slug: string, title: string, labels: string[], body: string}, libraryID?: number) : Promise<void>
    {
        return this._rpcHelper('/api/notes/update', {library: libraryID}, 'POST', note);
    }

    retrieveAuth() : Promise<RetrieveSessionResponse>
    {
        return this._rpcHelper<RetrieveSessionResponse>('/auth/session.js');
    }

    login() : Promise<User>
    {
        return new Promise<User>((resolve, reject) => {
            (window as any).onLogin = (res: {sessionKey: string}) => {
                this.retrieveAuth()
                    .then(session => session.user ? resolve(session.user) : reject(new Error('Login failed')))
                    .catch(err => reject(err));
            };
            const popup = window.open('/auth/google/login', 'google_login', 'menubar=false,scrollbars=false,location=false,width=400,height=300');
        });
    }

    logout() : Promise<void>
    {
        return this._rpcHelper('/auth/logout');
    }

    private _makeQueryParams(params: any)
    {
        const makeQueryVar = (k: string, v: any) => encodeURIComponent(k) + '=' + encodeURIComponent(v);

        return Object.entries(params)
            .map(([k, v]) => v ? makeQueryVar(k, v) : null)
            .filter(s => s)
            .join('&');
    }

    private async _rpcHelper<T>(path: string, query?: any, method?: 'GET'|'POST'|'PUT'|'DELETE', body?: any) : Promise<T>
    {
        const queryArgs = query ? this._makeQueryParams(query) : undefined;
        const fullPath = this.rootURL + path + (queryArgs ? '?' + queryArgs : '');
        const fetchMethod = method || 'GET';

        const jsonBody = body ? JSON.stringify(body) : undefined;
        const headers = body ? new Headers({'Content-Type': 'application/json'}) : undefined;

        const result = await fetch(fullPath, {credentials: 'include', method: fetchMethod, headers, body: jsonBody});
        if (!result.ok)
        {
            console.warn(fullPath + ': returned status code ' + result.status);
            throw new APIError(result.statusText, result.status);
        }

        try
        {
            const jsonResult = await result.json();
            return jsonResult as T;
        }
        catch (err)
        {
            console.error(fullPath + ': ' + err, err.stack);
            throw err;
        }
    }
}