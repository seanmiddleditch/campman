export interface CharacterData
{
    id?: number
    title?: string
    slug?: string
    portrait?: File|{contentMD5: string}
    rawbody?: object
    visible?: boolean
}
