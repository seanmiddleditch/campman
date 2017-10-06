import * as squell from 'squell'
import {LibraryModel, LibraryAccessModel} from '../models'

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
    ['media:upload']: AccessControls
    ['media:list']: AccessControls
    ['note:view']: AccessControls
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
        p => p.userID !== null
    ],
    'media:upload': [
        p => p.role !== Role.Visitor
    ],
    'media:list': [
        p => p.role !== Role.Visitor
    ],
    'note:view': [
        p => p.ownerID === p.userID,
        p => p.role === Role.Owner,
        p => p.role === Role.GameMaster,
        p => !p.hidden
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

interface QueryUserRoleParams { userID?: number, libraryID?: number }
export async function queryUserRole(db: squell.Database, {libraryID, userID} : QueryUserRoleParams)
{
    if (userID && libraryID)
    {
        const rs = await db.query(LibraryAccessModel)
            .attributes(m => [m.role])
            .where(m => squell.attribute('userId').eq(userID))
            .where(m => squell.attribute('libraryId').eq(libraryID))
            .findOne()
        return rs ? rs.role : Role.Visitor
    }
    else
    {
        return Role.Visitor
    }
}