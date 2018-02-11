import {MediaFile} from '../../common/types'
import {MediaContent} from '../../common/rpc/media-content'

export class MediaAPI implements MediaContent
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

    async listFiles(path: string) : Promise<MediaFile[]>
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

    async deleteFile(path: string)
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
        return `/media/img/full/${hash}.${ext}`
    }

    getThumbURL(hash: string, size: number)
    {
        return `/media/img/thumb/${size}/${hash}.png`
    }
}