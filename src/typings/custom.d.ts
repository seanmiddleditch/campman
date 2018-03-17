import { CampaignModel } from '../app/models/campaign'
import { CampaignRole } from '../app/auth/access'
import { ProfileData, CampaignData } from '../types'


declare global
{
    namespace Express
    {
        export interface Express
        {
            locals: {

            }
        }
        export interface Request
        {
            domainSlug: string
            campaign?: CampaignModel
            profileId: number
            campaignRole: CampaignRole
        }
        export interface Response
        {
            locals: {
                profile: ProfileData
                campaign: CampaignData
            }
        }
    }
}