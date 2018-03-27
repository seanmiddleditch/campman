import { Config } from './config'
import { ProfileData, CampaignData, AdventureData } from '../types'

export type Mapping<T> = {[key: string]: T|undefined}

export interface State
{
    config: Config
    profile?: ProfileData
    campaign?: CampaignData
    data: {
        campaigns?: Mapping<CampaignData>
        adventures?: Mapping<AdventureData>
    }
    indices: {
        campaigns?: number[]
        adventures?: number[]
    }
    join?: {
        success: boolean,
        error?: string
    }
}