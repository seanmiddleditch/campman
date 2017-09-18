import User from './User';

export class APIError extends Error
{
    public readonly status?: number;

    constructor(error: string, status?: number)
    {
        super(error);
        this.status = status;
    }
}

class RPCHelper
{
    private _root: string;

    constructor(root: string)
    {
        this._root = root;
    }
  
    private static _makeQueryParams(params: any)
    {
        const makeQueryVar = (k: string, v: any) => encodeURIComponent(k) + '=' + encodeURIComponent(v);

        return Object.entries(params)
            .map(([k, v]) => v ? makeQueryVar(k, v) : null)
            .filter(s => s)
            .join('&');
    }

    private static async _processResult<T>(url: string, result: any)
    {
        if (!result.ok)
        {
            console.warn(url + ': returned status code ' + result.status);
            throw new APIError(result.statusText, result.status);
        }

        try
        {
            const jsonResult = await result.json();
            if (jsonResult.status == 'success')
            {
                return jsonResult.data as T;
            }
            else
            {
                throw new APIError(jsonResult.message, jsonResult.code || 400);
            }
        }
        catch (err)
        {
            console.error(url + ': ' + err.message, err.stack);
            throw err;
        }
    }

    async _bodyHelper<T>(params: {method: 'GET'|'POST'|'DELETE'|'PUT', url: string, body?: any}) : Promise<T>
    {
        const url = this._root + params.url;
        const result = await fetch(url, {
            credentials: 'include',
            method: params.method,
            headers: params.body ? new Headers({'Content-Type': 'application/json'}) : undefined,
            body: params.body ? JSON.stringify(params.body) : undefined
        });
        return RPCHelper._processResult<T>(url, result);
    }

    async get<T>(path: string, query?: any) : Promise<T>
    {
        const queryArgs = query ? RPCHelper._makeQueryParams(query) : undefined;
        const url = this._root + path + (queryArgs ? '?' + queryArgs : '');

        const result = await fetch(url, {credentials: 'include', method: 'GET'});
        return RPCHelper._processResult<T>(url, result);

    }

    post<T>(url: string, body?: any) : Promise<T>
    {
        return this._bodyHelper({method: 'POST', url, body});
    }

    delete<T>(url: string, body?: any) : Promise<T>
    {
        return this._bodyHelper({method: 'DELETE', url, body});
    }
}

export class Library
{
    readonly slug: string;

    constructor(private helper: RPCHelper, library: {slug: string})
    {
        this.slug = library.slug;
    }

    labels() : Promise<Labels>
    {
        return this.helper.get<Labels>('/api/libraries/' + this.slug + '/labels');
    }

    label(slug: string) : Promise<Label>
    {
        return this.helper.get<Label>('/api/libraries/' + this.slug + '/labels/' + slug);
    }

    notes() : Promise<Note[]>
    {
        return this.helper.get<NoteFields[]>('/api/libraries/' + this.slug + '/notes').then(notes => notes.map(note => new Note(this.helper, this, note)));
    }

    note(slug: string) : Promise<Note>
    {
        return this.helper.get<NoteFields>('/api/libraries/' + this.slug + '/notes/' + slug)
            .then(note => new Note(this.helper, this, note));
    }
}

export interface Label
{
    slug: string;
    notes: {slug: string; title: string}[]
};
export type Labels = {slug: string, notes: number}[];
export interface NoteFields
{
    slug: string;
    title: string;
    subtitle: string;
    body: string;
    labels: string[];
};
export class Note implements NoteFields
{
    slug: string;
    title: string;
    subtitle: string;
    body: string;
    labels: string[];

    constructor(private helper: RPCHelper, readonly library: Library, fields: NoteFields)
    {
        this.slug = fields.slug;
        this.title = fields.title;
        this.subtitle = fields.subtitle;
        this.body = fields.body;
        this.labels = fields.labels;
    }

    delete() : Promise<void>
    {
        return this.helper.delete('/api/libraries/' + this.library.slug + '/notes/' + this.slug);
    }

    update() : Promise<void>
    {
        return this.helper.post('/api/libraries/' + this.library.slug + '/notes/' + this.slug, {
            title: this.title,
            subtitle: this.subtitle,
            body: this.body,
            labels: this.labels
        });
    }
};

export default class ClientGateway
{
    private _helper: RPCHelper;

    constructor(rootURL?: string)
    {
        const root = rootURL || (() => {
            const loc = window.location;
            return `${loc.protocol}//${loc.host}`;
        })();
        this._helper = new RPCHelper(root);
    }

    get helper() { return this._helper; }

    libraries() : Promise<Library[]>
    {
        return this._helper.get('/api/libraries');
    }

    library(slug: string)
    {
        return this._helper.get<{slug: string}>('/api/libraries/' + slug).then(library => new Library(this._helper, library));
    }

    retrieveAuth() : Promise<any>
    {
        return this._helper.get('/auth/session');
    }

    login() : Promise<User>
    {
        return new Promise<User>((resolve, reject) => {
            const handler = (ev: any) => {
                window.removeEventListener('message', handler);
                this.retrieveAuth()
                    .then(session => session.user ? resolve(session.user) : reject(new Error('Login failed')))
                    .catch(err => reject(err));
            };
            window.addEventListener('message', handler, false);
            const popup = window.open('/auth/google/login', 'google_login', 'menubar=false,scrollbars=false,location=false,width=400,height=300');
        });
    }

    logout() : Promise<void>
    {
        return this._helper.post('/auth/logout');
    }
}