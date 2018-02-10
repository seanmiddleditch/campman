import {config} from './config'

export class MediaFile
{
    path?: string
    contentMD5: string
    extension: string
    caption?: string
}

export class MediaAPI
{
    async uploadFile({file, path, caption}: {file: File, path?: string, caption?: string})
    {
        path = path || `/${file.name}`

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
        if (body.status !== 'success')
            throw new Error(body.message)

        const result = body.body

        return {
            contentMD5: result.contentMD5,
            extension: result.extension,
            path: result.path
        }
    }

    async listFiles(path) : Promise<MediaFile[]>
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

    async deleteFile(path)
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

    getImageURL(hash: string, ext: string)
    {
        const url = new URL(`/img/full/${hash}.${ext}`, config.publicURL.toString())
        url.hostname = `media.${url.hostname}`
        return url.toString()
    }

    getThumbURL(hash: string, size: number)
    {
        const url = new URL(`/img/thumb/${size}/${hash}.png`, config.publicURL.toString())
        url.hostname = `media.${url.hostname}`
        return url.toString()
    }
}