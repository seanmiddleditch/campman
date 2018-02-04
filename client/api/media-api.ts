
interface MediaAPIPresignParams
{
    contentType: string
    contentSize: number
    contentMD5: string
    path: string
    caption?: string
    fileHead: string
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
    private async _presign({contentType, contentSize, contentMD5, path, caption, fileHead}: MediaAPIPresignParams) : Promise<MediaAPIPresignResult>
    {
        const response = await fetch(`/files${path}`, {
            method: 'PUT',
            headers: new Headers({'Content-Type': 'application/json'}),
            mode: 'same-origin',
            credentials: 'include',
            body: JSON.stringify({contentType, contentSize, contentMD5, caption, head: fileHead})
        })
        if (!response.ok)
            throw new Error(response.statusText)
        const body = await response.json()
        if (body.status == 'success')
            return body.body
        else
            throw new Error(body.status)
    }

    private async _verify({path, contentMD5}: {path: string, contentMD5: string})
    {
        const response = await fetch(`/files${path}`, {
            method: 'POST',
            headers: new Headers({'Content-Type': 'application/json'}),
            mode: 'same-origin',
            credentials: 'include',
            body: JSON.stringify({contentMD5})
        })
        if (!response.ok)
            throw new Error(response.statusText)
        const body = await response.json()
        if (body.status == 'success')
            return
        else
            throw new Error(body.status)
    }

    private async _s3PutObject({url, file, contentType, contentMD5}: {url: string, file: File, contentType: string, contentMD5: string})
    {
        const result = await fetch(url, {
            method: 'PUT',
            mode: 'cors',
            headers: new Headers({
                'Content-Type': contentType,
                'Content-MD5': contentMD5
            }),
            body: file
        })
        if (!result.ok || result.status !== 200)
            throw new Error(result.statusText)
    }

    async upload({file, path, caption}: {file: File, path?: string, caption?: string})
    {
        path = path || `/${file.name}`
        const contentType = file.type
        const contentSize = file.size

        const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onloadend = ev => {
                if (reader.error) reject(reader.error)
                else resolve(reader.result)
            }
        })
        const contentMD5 = btoa(window['SparkMD5'].ArrayBuffer.hash(buffer, /*raw=*/true))
        const fileHead = btoa(Array.from(new Uint8Array(buffer.slice(0, 64))).map(b => String.fromCharCode(b)).join(''))

        const signed = await this._presign({contentType, contentSize, contentMD5, path, caption, fileHead})
        if (signed.signed_put_url)
        {
            const put = await this._s3PutObject({url: signed.signed_put_url, file, contentType, contentMD5})
            await this._verify({path: signed.path, contentMD5})
        }

        return {
            url: signed.url,
            thumb_url: signed.thumb_url,
            path: signed.path
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
            throw new Error(body.status)

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
            throw new Error(body.status)
    }
}