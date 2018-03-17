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
    id: number
    slug: string
    title: string
    rawbody: RawDraftContentState
    tags: string
    visibility: 'Public'|'Hidden'
}
export type WikiPageInput = Partial<WikiPageData>


export interface CampaignData
{
    id: number
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
export interface FileImageData
{
    readonly id: number
    readonly contentMD5: string
    readonly extension: string
    readonly byteLength: number
    readonly imageWidth: number
    readonly imageHeight: number
}


export interface MapData
{
    id: number
    slug: string
    title: string
    rawbody: RawDraftContentState
    storage: FileImageData,
}


export interface ProfileData
{
    id: number
    nickname?: string
    fullname: string
    photoURL?: string
}


export interface AdventureData
{
    readonly id: number
    readonly created_at: Date
    readonly title: string
    readonly rawbody: RawDraftContentState
    readonly visible: boolean
}
export type AdventureInput = Partial<AdventureData>