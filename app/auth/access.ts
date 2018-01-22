import {LibraryModel, MembershipModel} from '../models'

export enum Role
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
    ['label:view']: AccessControls
    ['library:view']: AccessControls
    ['library:create']: AccessControls
    ['library:configure']: AccessControls
    ['library:invite']: AccessControls
    ['media:upload']: AccessControls
    ['media:list']: AccessControls
    ['media:delete']: AccessControls
    ['maps:list']: AccessControls
    ['note:view']: AccessControls
    ['note:view-secret']: AccessControls
    ['note:create']: AccessControls
    ['note:edit']: AccessControls
    ['note:delete']: AccessControls
}

export const accessConfiguration : AccessConfiguration = {
    'label:view': [
        p => p.role !== Role.Visitor
    ],
    'library:view': [
        p => p.ownerID === p.userID,
        p => p.role !== Role.Visitor,
        p => !p.hidden
    ],
    'library:create': [
        p => !!p.userID,
    ],
    'library:configure': [
        p => p.role === Role.Owner
    ],
    'library:invite': [
        p => p.role === Role.Owner
    ],
    'media:upload': [
        p => p.role !== Role.Visitor
    ],
    'media:delete': [
        p => p.role !== Role.Visitor
    ],
    'media:list': [
        p => !p.hidden
    ],
    'maps:list': [
        p => !p.hidden
    ],
    'note:view': [
        p => p.ownerID === p.userID,
        p => p.role === Role.Owner,
        p => p.role === Role.GameMaster,
        p => !p.hidden
    ],
    'note:view-secret': [
        p => p.role === Role.Owner,
        p => p.role === Role.GameMaster
    ],
    'note:create': [
        p => p.role === Role.Owner,
        p => p.role === Role.GameMaster,
    ],
    'note:edit': [
        p => p.ownerID === p.userID,
        p => p.role === Role.Owner,
        p => p.role === Role.GameMaster,
    ],
    'note:delete': [
        p => p.ownerID === p.userID,
        p => p.role === Role.Owner,
    ]
}

export type AccessTargets = keyof AccessConfiguration

export interface AccessParams
{
    target: AccessTargets
    userID?: number
    ownerID?: number
    hidden?: boolean
    role: Role
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
