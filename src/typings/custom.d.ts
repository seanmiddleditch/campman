import {CampaignModel} from '../app/models/campaign'
import {CampaignRole} from '../app/auth/access'

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