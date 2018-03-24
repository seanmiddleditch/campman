import { Config } from './config'
import { State } from './state'
import { CampaignData, ProfileData, AdventureData } from '../types'

type SerializedState = {
    config: {
        publicURL: string
    },
    profile?: ProfileData,
    campaign?: CampaignData,
    data: {
        campaigns?: CampaignData[]
        adventures?: AdventureData[]
    }
}

export function serializeState(state: State): SerializedState
{
    return {
        config: {
            publicURL: state.config.publicURL
        },
        profile: state.profile,
        campaign: state.campaign,
        data: {
            campaigns: state.data.campaigns,
            adventures: state.data.adventures
        }
    }
}

export function deserializeState(state: SerializedState): State
{
    return {
        ...state,
        config: {
            publicURL: state.config.publicURL
        },
        data: {
            campaigns: state.data.campaigns,
            adventures: state.data.adventures
        }
    } as State
}