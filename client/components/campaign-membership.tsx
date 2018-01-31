import * as React from 'react'

interface Member
{
    fullname: string
    nickname?: string
    photoURL: string
    email: string
    role: string
    id: number
}

interface MemberItemProps
{
    member: Member
    onDeleted: (id: number) => void
}
interface MemberItemState
{
    role: string
    action?: 'saving'|'deleting'
}
class MemberItem extends React.Component<MemberItemProps, MemberItemState>
{
    constructor(props: MemberItemProps)
    {
        super(props)
        this.state = {
            role: props.member.role
        }
    }

    private _handleRoleChanged(ev: React.ChangeEvent<HTMLSelectElement>)
    {
        ev.preventDefault()
        if (!this.state.action)
        {
            this.setState({role: ev.target.value})
            const promise = fetch(`/membership/${this.props.member.id}`, {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    profileId: this.props.member.id,
                    role: ev.target.value
                })
            }).then(response => {
                if (!response.ok)
                    throw new Error(response.statusText)
                return response.json()
            }).then(result => {
                if (result.status !== 'success')
                    throw new Error(result.message)
                this.setState({action: undefined})
            }).catch(err => {
                this.setState({action: undefined})
                alert(err)
            })
            this.setState({action: 'saving'})
        }
    }

    private _handleDeleteClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        ev.preventDefault()
        if (!confirm('Are you sure you want to permanently remove this membership?'))
            return

        const promise = fetch(`/membership/${this.props.member.id}`, {
            method: 'DELETE',
            mode: 'cors',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                profileId: this.props.member.id
            })
        }).then(response => {
            if (!response.ok)
                throw new Error(response.statusText)
            return response.json()
        }).then(result => {
            if (result.status !== 'success')
                throw new Error(result.message)
            this.setState({action: undefined})
            this.props.onDeleted(this.props.member.id)
        }).catch(err => {
            this.setState({action: undefined})
            alert(err)
        })
        this.setState({action: 'deleting'})
    }

    public render()
    {
        const member = this.props.member
        return (
            <tr>
                <td><img src={member.photoURL} width={32} height={32}/></td>
                <td>{member.nickname ? member.nickname : member.fullname}</td>
                <td><a href={'mailto:' + member.email}>{member.email}</a></td>
                <td>{member.role === 'Owner' ? 'Owner' :
                    (<select value={this.state.role} disabled={!!this.state.action} onChange={ev => this._handleRoleChanged(ev)}>
                        <option value='GameMaster'>GM</option>
                        <option value='Player'>Player</option>
                    </select>)
                }{this.state.action === 'saving' ? <i className='fa fa-spinner fa-spin'></i> : <span/>}</td>
                <td>
                    {member.role !== 'Owner' && (<button className='btn btn-danger' disabled={!!this.state.action} onClick={ev =>this._handleDeleteClicked(ev)}>
                        {this.state.action === 'deleting' ?
                            <i className='fa fa-spinner fa-spin'></i> :
                            <i className='fa fa-trash-o'></i>
                        }</button>)
                    }
                </td>
            </tr>
        )
    }
}

interface InviteMemberState
{
    inviteEmail: string
    message?: string
    error?: string
    promise?: Promise<void>
}
class InviteMember extends React.Component<{}, InviteMemberState>
{
    constructor(props: {})
    {
        super(props)
        this.state = {
            inviteEmail: ''
        }
    }
    
    private _handleInviteEmailChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        ev.preventDefault()
        this.setState({inviteEmail: ev.target.value})
    }

    private _handleInviteClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        ev.preventDefault()
        const promise = fetch('/membership', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                email: this.state.inviteEmail
            })
        }).then(response => {
            if (!response.ok)
                throw new Error(response.statusText)
            return response.json()
        }).then(result => {
            if (result.status !== 'success')
                throw new Error(result.message)
            this.setState({message: 'Invitation sent!', promise: undefined})
        }).catch(err => {
            console.error(err)
            this.setState({error: err.toString(), promise: undefined})
        })
        this.setState({promise, message: undefined, error: undefined})
    }

    public render()
    {
        return (<tfoot>
            {this.state.message && <tr>
                <td colSpan={5}>
                    <div className='alert alert-primary'>{this.state.message}</div>
                </td>
            </tr>}
            {this.state.error && <tr>
                <td colSpan={5}>
                    <div className='alert alert-danger'>{this.state.error}</div>
                </td>
            </tr>}
            <tr>
                <td/>
                <td colSpan={2}>
                    <input className='form-control' type='text' disabled={!!this.state.promise} value={this.state.inviteEmail} onChange={ev => this._handleInviteEmailChanged(ev)} placeholder='email address'/>
                </td>
                <td>
                    Player
                </td>
                <td>
                    <button className='btn btn-primary' disabled={!!this.state.promise} onClick={ev => this._handleInviteClicked(ev)}>
                        {this.state.promise ?
                            <span><i className='fa fa-spinner fa-spin'></i> Sending</span>:
                            <span><i className='fa fa-envelope-o'></i> Send Invite</span>
                        }
                    </button>
                </td>
            </tr>
        </tfoot>)
    }
}

interface MemberState extends Member
{
    promise?: Promise<void>
}

interface Props
{
    members: [Member]
}
interface State
{
    members: [MemberState]
}
export class CampaignMembership extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {
            members: props.members.map(m => ({...m})) as any /* TS bug? */
        }
    }

    private _handleDeleted(profileId: number)
    {
        this.setState({
            members: this.state.members.filter(m => m.id !== profileId) as any
        })
    }

    render()
    {
        return (
            <table className='table'>
                <thead>
                    <tr>
                        <th/>
                        <th scope='col'>Name</th>
                        <th scope='col'>Email</th>
                        <th scope='col'>Role</th>
                        <th/>
                    </tr>
                </thead>
                <tbody>
                    {this.state.members.filter(m => m.role !== 'Visitor').map(member => (
                        <MemberItem key={member.id} member={member} onDeleted={id => this._handleDeleted(id)}/>
                    ))}
                </tbody>
                <InviteMember/>
            </table>
        )
    }
}