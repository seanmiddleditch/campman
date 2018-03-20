import {
    CharacterInput, CharacterData,
    CampaignInput, CampaignData,
    WikiPageInput, WikiPageData,
    AdventureInput, AdventureData,
    MediaFile,
    ProfileData
} from './content'

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
    showLoginDialog(): Promise<ProfileData|undefined>
    endSession(): Promise<void>

    saveCharacter(char: CharacterInput): Promise<CharacterData>
    deleteCharacter(data: {characterId: number}): Promise<void>

    uploadFile(props: {file: File, path?: string, caption?: string}): Promise<MediaFile>
    listFiles(data: {campaignId: number, path?: string}): Promise<MediaFile[]>
    deleteFile(path: string): Promise<void>

    listCampaigns(): Promise<CampaignData[]>
    createCampaign(camp: CampaignInput): Promise<CampaignData>
    saveSettings(camp: CampaignInput): Promise<void>

    saveWikiPage(page: WikiPageInput): Promise<WikiPageData>
    deletePage(data: {pageId: number}): Promise<void>

    listProfiles(data: {campaignId: number}): Promise<ProfileData[]>

    createAdventure(data: {campaignId: number, adventure: AdventureInput}): Promise<AdventureData>
    updateAdventure(data: {campaignId: number, adventure: AdventureInput}): Promise<AdventureData>
    deleteAdventure(data: {campaignId: number, adventureId: number}): Promise<void>
}