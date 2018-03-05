import {API, CharacterInput, CharacterData, MediaFile, APIError, WikiPageInput, WikiPageData, CampaignInput, CampaignData} from '../../common/types'

export class ClientAPI implements API
{
    private _publicURL: string

    constructor(public publicURL: string)
    {
        this._publicURL = publicURL
    }

    public async saveCharacter(char: CharacterInput) : Promise<CharacterData>
    {
        const body = new FormData()
        if (char.id) body.append('id', char.id.toString())
        if (char.slug) body.append('slug', char.slug)
        if (char.title) body.append('title', char.title)
        if ('visible' in char) body.append('visible', char.visible ? 'visible' : '')
        if (char.portrait instanceof File) body.append('portrait', char.portrait)
        if (char.rawbody) body.append('rawbody', char.rawbody ? JSON.stringify(char.rawbody) : '')

        const response = await fetch('/chars', {
            method: 'POST',
            mode: 'same-origin',
            credentials: 'include',
            body
        })
        if (!response.ok)
            throw new Error(response.statusText)
        else if (response.status !== 200)
            throw new Error(response.statusText)

        const result = await response.json()

        if (result.status !== 'success')
        {
            const errors = result.errors
            throw new APIError(result.message, {errors})
        }

        return result.body as CharacterData
    }

    public async saveWikiPage(page: WikiPageInput) : Promise<WikiPageData>
    {
        const response = await fetch('/wiki', {
            method: 'POST',
            mode: 'same-origin',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }),
            body: JSON.stringify({...page, rawbody: JSON.stringify(page.rawbody)})
        })
        
        const result = await response.json()
        if (result.status !== 'success')
        {
            throw new APIError(result.message, result.errors)
        }

        return result.body
    }

    showLoginDialog() : Promise<void>
    {
        return new Promise((resolve, reject) => {
            (window as EventTarget).addEventListener('message', () => resolve(), {once:true})
            const loginURL = new URL('/auth/google/login', this._publicURL)
            const popup = window.open(loginURL.toString(), 'google_login', 'menubar=false,scrollbars=false,location=false,width=400,height=300')
        })
    }

    endSession() : Promise<void>
    {
        const logoutURL = new URL('/auth/logout', this._publicURL)
        return new Promise((resolve, reject) => {
            fetch(logoutURL.toString(), {method: 'POST', mode: 'cors', credentials: 'include'}).then(async (res) => {
                if (res.ok) resolve()
                else reject()
            })
        })
    }

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

    private async _saveCampaign(path: string, camp: CampaignInput) : Promise<CampaignData>
    {
        const response = await fetch(path, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({
                title: camp.title,
                slug: camp.slug,
                visibility: camp.visibility
            })
        })

        const result = await response.json()
        if (result.status !== 'success')
        {
            throw new APIError(result.message, {errors: {
                title: 'title' in result.fields ? result.fields['title'] as string : undefined,
                slug: 'slug' in result.fields ? result.fields['slug'] as string : undefined
            }})
        }

        return {
            title: result.body.title,
            slug: result.body.slug,
            visibility: result.body.visibility,
            url: result.body.url
        }
    }

    createCampaign(camp: CampaignInput)
    {
        return this._saveCampaign('/campaigns', camp)
    }

    async saveSettings(camp: CampaignInput) : Promise<void>
    {
        await this._saveCampaign('/settings', camp)
    }
}
