import {CampaignModel} from '../models/campaign'
import {CampaignRole} from '../auth/access'

declare global
{
    namespace Express
    {
        export interface Request
        {
            domainSlug: string
            campaign?: CampaignModel
            profileId: number
            campaignRole: CampaignRole
        }
    }
}