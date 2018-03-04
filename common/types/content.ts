export interface CharacterData
{
    id?: number
    title?: string
    slug?: string
    portrait?: File|{contentMD5: string}
    rawbody?: object
    visible?: boolean
}

export interface WikiData
{
    slug?: string
    title: string
    rawbody: object
    tags: string
    visibility: 'Public'|'Hidden'
}

export interface CampaignData
{
    slug: string
    title: string
    url: string
    visibility: 'Public'|'Hidden'
}