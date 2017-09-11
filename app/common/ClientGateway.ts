export type RetrieveLabelsResponse =
    {
        slug: string,
        notes: number
    }[];

export type RetrieveLabelResponse =
    {
        slug: string,
        notes: {
            slug: string,
            title: string
        }[]
    };

export type RetrieveNotesResponse =
    {
        slug: string,
        title: string,
        labels: string[]
    }[];

export type RetrieveNoteResponse =
    {
        slug: string,
        title: string,
        body: string,
        labels: string[]
    }

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

        const result = await fetch(fullPath, {'method': fetchMethod, headers, body: jsonBody});
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