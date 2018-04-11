import { Config } from './config'
import {
    ProfileData,
    CampaignData,
    AdventureData,
    CharacterData,
    WikiPageData,
    MapData
} from '../types'

export type Mapping<T> = {[key: string]: T|undefined}

export interface State
{
    config: Config
    profile?: ProfileData
    campaign?: CampaignData
    data: {
        campaigns?: Mapping<CampaignData>
        adventures?: Mapping<AdventureData>
        characters?: Mapping<CharacterData>
        pages?: Mapping<WikiPageData>
        maps?: Mapping<MapData>
    }
    indices: {
        campaigns?: number[]
        adventures?: number[]
        characters?: number[]
        pages?: number[]
        maps?: number[]
    }
    join?: {
        success: boolean,
        error?: string
    }
}