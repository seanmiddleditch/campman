import { Config } from './config'
import { State } from './state'
import { CampaignData, ProfileData } from '../types'

type SerializedState = {
    config: {
        publicURL: string
    },
    profile?: ProfileData,
    campaign?: CampaignData,
    campaigns: CampaignData[]
}

export function serializeState(state: State): SerializedState
{
    return {
        config: {
            publicURL: state.config.publicURL.toString()
        },
        profile: state.profile,
        campaign: state.campaign,
        campaigns: Array.from(state.campaigns.values())
    }
}

export function deserializeState(state: SerializedState): State
{
    return {
        ...state,
        config: {
            publicURL: new URL(state.config.publicURL)
        },
        campaigns: new Map<number, CampaignData>(state.campaigns.map(c => [c.id, c] as [number, CampaignData]))
    } as State
}