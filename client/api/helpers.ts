export class APIError extends Error
{
    public readonly status?: number
    public readonly data: any

    constructor(message: string, data: any, status: number)
    {
        super(message)
        this.data = data
        this.status = status
    }
}

export class RPCHelper
{
    private static _makeQueryParams(params: any)
    {
        const makeQueryVar = (k: string, v: any) => encodeURIComponent(k) + '=' + encodeURIComponent(v)

        return Object.getOwnPropertyNames(params)
            .map(name => params[name] ? makeQueryVar(name, params[name]) : null)
            .filter(s => s)
            .join('&')
    }

    private static async _processResult<T>(url: string, result: Response, json: any)
    {
        try
        {
            const ok = json && json.status === 'success' && json.data !== undefined
            if (ok)
            {
                return json.data as T
            }
            else
            {
                const message = (json && json.status === 'error' && json.message) || 'Malformed response'
                const code = result.status || 400
                console.error(`${url} (${code}): ${message}`)
                throw new APIError('Malformed response', json && json.data, code)
            }
        }
        catch (err)
        {
            console.error(url + ': ' + err.message, err.stack)
            throw err
        }
    }

    private async _bodyHelper<T>(params: {method: 'GET'|'POST'|'DELETE'|'PUT', url: string, body?: any}) : Promise<T>
    {
        const url = params.url
        const result = await fetch(url, {
            credentials: 'include',
            method: params.method,
            headers: params.body ? new Headers({'Content-Type': 'application/json'}) : undefined,
            body: params.body ? JSON.stringify(params.body) : undefined
        })
        const json = await result.json()
        return RPCHelper._processResult<T>(url, result, json)
    }

    async get<T>(url: string, query?: any) : Promise<T>
    {
        const queryArgs = query ? RPCHelper._makeQueryParams(query) : undefined
        const fullURL = url + (queryArgs ? '?' + queryArgs : '')

        const result = await fetch(fullURL, {credentials: 'include', method: 'GET'})
        const json = await result.json()
        return RPCHelper._processResult<T>(fullURL, result, json)

    }

    post<T>(url: string, body?: any) : Promise<T>
    {
        return this._bodyHelper({method: 'POST', url, body})
    }

    put<T>(url: string, body?: any) : Promise<T>
    {
        return this._bodyHelper({method: 'PUT', url, body})
    }

    delete<T>(url: string, body?: any) : Promise<T>
    {
        return this._bodyHelper({method: 'DELETE', url, body})
    }
}