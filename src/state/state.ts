import { Config } from './config'
import { ProfileData, CampaignData, AdventureData } from '../types'

export interface State
{
    config: Config
    profile?: ProfileData
    campaign?: CampaignData
    data: {
        campaigns?: CampaignData[]
        adventures?: AdventureData[]
    }
    join?: {
        success: boolean,
        error?: string
    }
}