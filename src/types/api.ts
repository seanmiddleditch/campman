import { CharacterInput, CharacterData, CampaignInput, CampaignData, WikiPageInput, WikiPageData, MediaFile, ProfileData } from './content'

export class APIError extends Error
{
    public readonly errors?: {[key: string]: string|undefined}

    public constructor(message: string, data?: {errors?: {[key: string]: string|undefined}})
    {
        super(message)
        this.errors = data && data.errors
    }
}

export interface API
{
    showLoginDialog(): Promise<void>
    endSession(): Promise<void>

    saveCharacter(char: CharacterInput) : Promise<CharacterData>

    uploadFile(props: {file: File, path?: string, caption?: string}): Promise<MediaFile>
    listFiles(data: {campaignId: number, path?: string}): Promise<MediaFile[]>
    deleteFile(path: string): Promise<void>

    createCampaign(camp: CampaignInput): Promise<CampaignData>
    saveSettings(camp: CampaignInput): Promise<void>

    saveWikiPage(page: WikiPageInput): Promise<WikiPageData>

    listProfiles(data: {campaignId: number}): Promise<ProfileData[]>
}