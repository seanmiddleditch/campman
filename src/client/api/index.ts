import {
    API, APIError,
    CharacterInput, CharacterData,
    MediaFile,
    WikiPageInput, WikiPageData,
    CampaignInput, CampaignData,
    AdventureInput, AdventureData,
    ProfileData
} from '../../types'
import * as urlJoin from 'url-join'

export class ClientAPI implements API
{
    private _publicURL: string
    private _apiURL: string

    constructor(publicURL: string, apiURL: string)
    {
        this._publicURL = publicURL
        this._apiURL = apiURL
    }

    private _encodeRequestBody<Body = {}|undefined>(body: Body)
    {
        if (!body)
            return {contentType: undefined, body: undefined}
        const hasFile = Object.entries(body).some(([key, value]) => value instanceof File || value instanceof Blob)
        if (hasFile)
        {
            const form = new FormData()
            for (const [key, value] of Object.entries(body))
                form.append(key, value)
            return {contentType: undefined, body: form}
        }
        else
        {
            return {contentType: 'application/json', body: JSON.stringify(body)}
        }
    }

    private async _callRemoteV1<Response, Body = {}>(uri: string, req: {campaignId?: number, method?: string, body?: Body}) : Promise<Response>
    {
        const method = req.method || 'GET'
        const {contentType, body} = this._encodeRequestBody(req.body)
        const headers = new Headers({
            'Accept': 'application/json'
        })
        if (contentType)
            headers.set('Content-Type', contentType)

        const response = await fetch(uri, {
            method,
            credentials: 'include',
            mode: 'cors',
            headers,
            body: body
        })

        const result = await response.json()

        if (!('status' in result))
            throw new APIError('Field "status" missing from JSON response body')

        if (result.status === 'success' && response.ok)
            return result.body as Response
        else if (result.status === 'error')
            throw new APIError(result.message || 'Unknown error', result.fields)
        else
            throw new APIError(`Invalid "status": "${result.status}"`)
    }

    private async _callRemote<Response, Body = {}>(uri: string, req: {campaignId?: number, method?: string, body?: Body}) : Promise<Response>
    {
        const fullUri = urlJoin(this._apiURL, '/api/v1', req.campaignId ? `/campaigns/${req.campaignId}` : '', uri)
        return this._callRemoteV1<Response, Body>(fullUri, req)
    }

    public async saveCharacter(char: CharacterInput) : Promise<CharacterData>
    {
        return this._callRemoteV1<CharacterData>('/chars', {method: 'POST', body: {...char, rawbody: JSON.stringify(char.rawbody)}})
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

    listFiles({campaignId, path}: {campaignId: number, path?: string}) : Promise<MediaFile[]>
    {
        const cleanPath = path && path.length !== 0 && path.charAt(0) === '/' ?
            path :
            `/${path}`

        return this._callRemote<MediaFile[]>(`/files${cleanPath}`, {campaignId})
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

    async saveSettings(camp: CampaignInput): Promise<void>
    {
        await this._saveCampaign('/settings', camp)
    }

    async listProfiles({campaignId}: {campaignId: number}): Promise<ProfileData[]>
    {
        return this._callRemote<ProfileData[]>('/members', {campaignId})
    }

    async createAdventure({campaignId, adventure}: {campaignId: number, adventure: AdventureInput}): Promise<AdventureData>
    {
        return this._callRemoteV1<AdventureData>('/new-adventure', {method: 'POST', campaignId, body: {...adventure, rawbody: JSON.stringify(adventure.rawbody)}})
    }

    async updateAdventure({campaignId, adventure}: {campaignId: number, adventure: AdventureInput}): Promise<AdventureData>
    {
        return this._callRemoteV1<AdventureData>('/adventures', {method: 'POST', campaignId, body: {...adventure, rawbody: JSON.stringify(adventure.rawbody)}})
    }
}
