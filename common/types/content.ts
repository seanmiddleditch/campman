export interface CharacterData
{
    id?: number
    title?: string
    slug?: string
    portrait?: File|{hash: string}
    body?: object
    visible?: boolean
}
