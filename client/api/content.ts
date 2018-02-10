export class ContentError extends Error
{
    public readonly errors?: any

    public constructor(message: string, {errors}: {errors?: any})
    {
        super(message)
        this.errors = errors
    }
}

export interface CharacterData
{
    id?: number
    title?: string
    slug?: string
    portrait?: File|{hash: string}
    body?: object
    visible?: boolean
}

export class ContentAPI
{
    public async saveCharacter(char: CharacterData) : Promise<CharacterData>
    {
        const body = new FormData()
        if (char.id) body.append('id', char.id.toString())
        if (char.slug) body.append('slug', char.slug)
        if (char.title) body.append('title', char.title)
        if (typeof char.visible === 'string') body.append('visible', char.visible ? 'visible' : '')
        if (char.portrait instanceof File) body.append('portrait', char.portrait)
        if (char.body) body.append('rawbody', char.body ? JSON.stringify(char.body) : '')

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
            throw new ContentError(result.message, {errors})
        }

        return result.body as CharacterData
    }
}