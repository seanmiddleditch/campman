export class APIError extends Error
{
    public readonly status?: number;

    constructor(error: string, status?: number)
    {
        super(error);
        this.status = status;
    }
}

export class RPCHelper
{
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

    private async _bodyHelper<T>(params: {method: 'GET'|'POST'|'DELETE'|'PUT', url: string, body?: any}) : Promise<T>
    {
        const url = params.url;
        const result = await fetch(url, {
            credentials: 'include',
            method: params.method,
            headers: params.body ? new Headers({'Content-Type': 'application/json'}) : undefined,
            body: params.body ? JSON.stringify(params.body) : undefined
        });
        return RPCHelper._processResult<T>(url, result);
    }

    async get<T>(url: string, query?: any) : Promise<T>
    {
        const queryArgs = query ? RPCHelper._makeQueryParams(query) : undefined;
        const fullURL = url + (queryArgs ? '?' + queryArgs : '');

        const result = await fetch(fullURL, {credentials: 'include', method: 'GET'});
        return RPCHelper._processResult<T>(fullURL, result);

    }

    post<T>(url: string, body?: any) : Promise<T>
    {
        return this._bodyHelper({method: 'POST', url, body});
    }

    put<T>(url: string, body?: any) : Promise<T>
    {
        return this._bodyHelper({method: 'PUT', url, body});
    }

    delete<T>(url: string, body?: any) : Promise<T>
    {
        return this._bodyHelper({method: 'DELETE', url, body});
    }
}