import { Config } from './config'
import { ProfileData, CampaignData } from '../types'

export interface State
{
    config: Config
    profile?: ProfileData
    campaign?: CampaignData
    campaigns: Map<number, CampaignData>
}