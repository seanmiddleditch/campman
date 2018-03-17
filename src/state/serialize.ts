import { Config } from './config'
import { State } from './state'
import { CampaignData, ProfileData } from '../types'

type SerializedState = {
    config: Config,
    profile?: ProfileData,
    campaign?: CampaignData,
    campaigns: CampaignData[]
}

export function serializeState(state: State): SerializedState
{
    return {
        config: state.config,
        profile: state.profile,
        campaign: state.campaign,
        campaigns: Array.from(state.campaigns.values())
    }
}

export function deserializeState(state: SerializedState): State
{
    return {
        ...state,
        campaigns: new Map<number, CampaignData>(state.campaigns.map(c => [c.id, c] as [number, CampaignData]))
    } as State
}