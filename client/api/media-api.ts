
interface MediaAPIPresignParams
{
    file: Blob
    path: string
    caption?: string
}
interface MediaAPIPresignResult
{
    url: string
    thumb_url: string
    signed_put_url?: string
    path: string
}

export class MediaAPI
{
    private async _putFile({file, path, caption}: MediaAPIPresignParams) : Promise<MediaAPIPresignResult>
    {
        const data = new FormData()
        data.append('file', file)
        if (caption)
            data.append('caption', caption)
        data.append('path', path)
        const response = await fetch(`/files`, {
            method: 'POST',
            mode: 'same-origin',
            credentials: 'include',
            body: data
        })
        if (!response.ok)
            throw new Error(response.statusText)
        const body = await response.json()
        if (body.status == 'success')
            return body.body
        else
            throw new Error(body.message)
    }

    async upload({file, path, caption}: {file: File, path?: string, caption?: string})
    {
        path = path || `/${file.name}`

        const result = await this._putFile({file, path, caption})

        return {
            url: result.url,
            path: result.path
        }
    }

    async list(path)
    {
        if (path.length === 0 || path.charAt(0) !== '/')
            path = `/${path}`

        const result = await fetch(`/files${path}`, {
            method: 'GET',
            mode: 'same-origin',
            credentials: 'include',
            headers: new Headers({'Accept': 'application/json'}),
        })
        if (!result.ok)
            throw new Error(result.statusText)

        const body = await result.json()

        if (body.status !== 'success')
            throw new Error(body.message)

        return body.body['files']
    }

    async delete(path)
    {
        const result = await fetch(`/files${path}`, {
            method: 'DELETE',
            mode: 'same-origin',
            credentials: 'include'
        })
        if (!result.ok)
            throw new Error(result.statusText)

        const body = await result.json()

        if (body.status !== 'success')
            throw new Error(body.message)
    }
}