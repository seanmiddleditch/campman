import * as React from 'react'

interface MembersTabProps
{
    disabled?: boolean
    members: {nickname: string, id: number, role: string}[]
    inviteEmail: string
    sendInvite: (email: string) => void
    inviteEmailChanged: (email: string) => void
}
export const MembersTab = (props: MembersTabProps) => (
    <ul className='list-group'>
        {(props.members.map(member => (
            <li key={member.id} className='list-group-item mt-sm-2'>
                <div className='form-group'>{member.nickname}</div>
                <div className='form-group'>
                    {member.role === 'Owner' ? 'Owner' : (
                        <select className='form-control mt-sm-2' disabled={props.disabled} onChange={ev => this._handleMemberRoleChanged(ev, member.id)}>
                            <option value='GameMaster' selected={member.role === 'GameMaster'}>GameMaster</option>
                            <option value='Player' selected={member.role === 'Player'}>Player</option>
                            <option value='Visitor' selected={member.role === 'Visitor'}>Visitor</option>
                        </select>
                    )}
                </div>
            </li>
        )))}
        <li className='list-group-item mt-sm-2'>
            <div className='form-group'>
                <label htmlFor='new-member-email'>Invite New Member</label>
                <input className='form-control' type='text' name='new-member-email' placeholder='email addres' disabled={props.disabled} value={props.inviteEmail} onChange={ev => props.inviteEmailChanged(ev.currentTarget.value)}/>
            </div>
            <div className='form-group float-right'>
                <button className='btn btn-primary' disabled={props.disabled} value={props.inviteEmail} onClick={() => props.sendInvite(props.inviteEmail)}>Send Invite</button>
            </div>
        </li>
    </ul>
)