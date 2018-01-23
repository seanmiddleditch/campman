import {CampaignModel, MembershipModel} from '../models'

export enum CampaignRole
{
    Owner = 'Owner',
    GameMaster = 'GameMaster',
    Player = 'Player',
    Visitor = 'Visitor'
}

type AccessCondition = (params: AccessParams) => boolean
type AccessControls = AccessCondition[]

interface AccessConfiguration
{
    ['tag:view']: AccessControls
    ['campaign:view']: AccessControls
    ['campaign:create']: AccessControls
    ['campaign:configure']: AccessControls
    ['campaign:invite']: AccessControls
    ['media:upload']: AccessControls
    ['media:list']: AccessControls
    ['media:delete']: AccessControls
    ['maps:list']: AccessControls
    ['page:view']: AccessControls
    ['page:view-secret']: AccessControls
    ['page:create']: AccessControls
    ['page:edit']: AccessControls
    ['page:delete']: AccessControls
}

export const accessConfiguration : AccessConfiguration = {
    'tag:view': [
        p => p.role !== CampaignRole.Visitor
    ],
    'campaign:view': [
        p => p.ownerID === p.profileId,
        p => p.role !== CampaignRole.Visitor,
        p => !p.hidden
    ],
    'campaign:create': [
        p => !!p.profileId,
    ],
    'campaign:configure': [
        p => p.role === CampaignRole.Owner
    ],
    'campaign:invite': [
        p => p.role === CampaignRole.Owner
    ],
    'media:upload': [
        p => p.role !== CampaignRole.Visitor
    ],
    'media:delete': [
        p => p.role !== CampaignRole.Visitor
    ],
    'media:list': [
        p => !p.hidden
    ],
    'maps:list': [
        p => !p.hidden
    ],
    'page:view': [
        p => p.ownerID === p.profileId,
        p => p.role === CampaignRole.Owner,
        p => p.role === CampaignRole.GameMaster,
        p => !p.hidden
    ],
    'page:view-secret': [
        p => p.role === CampaignRole.Owner,
        p => p.role === CampaignRole.GameMaster
    ],
    'page:create': [
        p => p.role === CampaignRole.Owner,
        p => p.role === CampaignRole.GameMaster,
    ],
    'page:edit': [
        p => p.ownerID === p.profileId,
        p => p.role === CampaignRole.Owner,
        p => p.role === CampaignRole.GameMaster,
    ],
    'page:delete': [
        p => p.ownerID === p.profileId,
        p => p.role === CampaignRole.Owner,
    ]
}

export type AccessTargets = keyof AccessConfiguration

export interface AccessParams
{
    target: AccessTargets
    profileId?: number
    ownerID?: number
    hidden?: boolean
    role: CampaignRole
}

export function checkAccess(params: AccessParams) : boolean
{
    const access = accessConfiguration[params.target]

    for (const condition of access)
    {
        if (condition(params))
        {
            return true
        }
    }

    return false
}
