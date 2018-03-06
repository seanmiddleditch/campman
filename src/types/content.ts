import { RawDraftContentState } from 'draft-js'

export interface CharacterData
{
    id: number
    title: string
    slug: string
    owner?: number
    portrait?: {contentMD5: string}
    rawbody: RawDraftContentState
    visible: boolean
}
export interface CharacterInput
{
    id?: number
    title?: string
    slug?: string
    owner?: number
    portrait?: File|{contentMD5: string}
    rawbody?: RawDraftContentState
    visible?: boolean
}


export interface WikiPageData
{
    slug: string
    title: string
    rawbody: RawDraftContentState
    tags: string
    visibility: 'Public'|'Hidden'
}
export type WikiPageInput = Partial<WikiPageData>


export interface CampaignData
{
    slug: string
    title: string
    url: string
    visibility: 'Public'|'Hidden'
}
export interface CampaignInput
{
    slug?: string
    title?: string
    visibility?: 'Public'|'Hidden'
}

export interface MediaFile
{
    path: string
    contentMD5: string
    extension: string
    caption?: string
}

export interface ProfileData
{
    id: number
    nickname?: string
    fullname: string
    photoURL?: string
}