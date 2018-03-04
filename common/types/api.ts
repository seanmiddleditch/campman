import {MediaFile} from './media'
import {CharacterInput, CharacterData, CampaignInput, CampaignData, WikiPageInput, WikiPageData} from './content'

export class APIError extends Error
{
    public readonly errors?: {[key: string]: string|undefined}

    public constructor(message: string, {errors}: {errors?: {[key: string]: string|undefined}})
    {
        super(message)
        this.errors = errors
    }
}

export interface API
{
    showLoginDialog() : Promise<void>
    endSession() : Promise<void>

    saveCharacter(char: CharacterInput) : Promise<CharacterData>

    uploadFile(props: {file: File, path?: string, caption?: string}) : Promise<MediaFile>
    listFiles(path: string): Promise<MediaFile[]>
    deleteFile(path: string): Promise<void>
    getImageURL(hash: string, ext: string): string
    getThumbURL(hash: string, size: number): string

    createCampaign(camp: CampaignInput): Promise<CampaignData>
    saveSettings(camp: CampaignInput): Promise<void>

    saveWikiPage(page: WikiPageInput): Promise<WikiPageData>
}