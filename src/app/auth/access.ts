import {CampaignModel, MembershipModel} from '../models'
import {CampaignRole} from './role'
export {CampaignRole}

interface AccessParams
{
    profileId?: number
    ownerId?: number
    hidden?: boolean
    role: CampaignRole
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
    ['map:view']: AccessControls
    ['map:create']: AccessControls
    ['page:view']: AccessControls
    ['page:view-secret']: AccessControls
    ['page:create']: AccessControls
    ['page:edit']: AccessControls
    ['page:delete']: AccessControls
    ['character:view']: AccessControls
    ['character:view-secret']: AccessControls
    ['character:create']: AccessControls
    ['character:edit']: AccessControls
}

export const accessConfiguration : AccessConfiguration = {
    'tag:view': [
        p => p.role !== CampaignRole.Visitor
    ],
    'campaign:view': [
        p => p.ownerId === p.profileId,
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
    'map:view': [
        p => p.ownerId === p.profileId,
        p => p.role === CampaignRole.Owner,
        p => p.role === CampaignRole.GameMaster,
        p => !p.hidden
    ],
    'map:create': [
        p => p.role === CampaignRole.Owner,
        p => p.role === CampaignRole.GameMaster
    ],
    'page:view': [
        p => p.ownerId === p.profileId,
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
        p => p.ownerId === p.profileId,
        p => p.role === CampaignRole.Owner,
        p => p.role === CampaignRole.GameMaster,
    ],
    'page:delete': [
        p => p.ownerId === p.profileId,
        p => p.role === CampaignRole.Owner,
    ],
    'character:view': [
        p => p.ownerId === p.profileId,
        p => p.role === CampaignRole.Owner,
        p => p.role === CampaignRole.GameMaster,
        p => !p.hidden
    ],
    'character:view-secret': [
        p => p.role === CampaignRole.Owner,
        p => p.role === CampaignRole.GameMaster
    ],
    'character:create': [
        p => p.role !== CampaignRole.Visitor
    ],
    'character:edit': [
        p => p.ownerId === p.profileId,
        p => p.role === CampaignRole.Owner,
        p => p.role === CampaignRole.GameMaster,
    ]
}
type AccessTargets = keyof AccessConfiguration

export function checkAccess(target: AccessTargets, params: AccessParams) : boolean
{
    const access = accessConfiguration[target]

    for (const condition of access)
    {
        if (condition(params))
        {
            return true
        }
    }

    return false
}
