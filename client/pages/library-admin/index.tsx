import * as React from 'react'

import {Page, PageHeader, PageBody} from '../../components/page'

import * as api from '../../api'

enum Status
{
    Idle,
    Fetching,
    Saving
}

interface LibraryAdminPageProps
{
    slug: string
}
interface LibraryAdminPageState
{
    status: Status
    title: string
    visibility: 'Public'|'Hidden'
    members: {userID: number, role: string, nickname: string}[]
    tab: 'Settings'|'Members'
    inviteEmail: string
}
export class LibraryAdminPage extends React.Component<LibraryAdminPageProps, LibraryAdminPageState>
{
    constructor(props: LibraryAdminPageProps)
    {
        super(props)
        this.state = {
            status: Status.Idle,
            title: 'Test',
            visibility: 'Hidden',
            tab: 'Settings',
            members: [],
            inviteEmail: ''
        }
    }

    private _fetch()
    {
        if (this.state.status == Status.Idle)
        {
            this.setState({status: Status.Fetching})
            api.libraries.fetchSettings({slug: this.props.slug})
                .then(settings => this.setState({...settings, status: Status.Idle}))
        }
    }

    componentDidMount()
    {
        this._fetch()
    }

    private _handleTitleChanged(ev: React.FormEvent<HTMLInputElement>)
    {
        this.setState({title: ev.currentTarget.value})
    }

    private _handleVisibilityClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        this.setState({visibility: this.state.visibility === 'Public' ? 'Hidden' : 'Public'})
    }

    private _handleSaveClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        if (this.state.status === Status.Idle)
        {
            this.setState({status: Status.Saving})
            api.libraries.saveSettings({slug: this.props.slug, title: this.state.title, visibility: this.state.visibility})
                .then(() => this.setState({status: Status.Idle}))
                .catch(() => this.setState({status: Status.Idle}))
        }
    }

    private _handleInviteEmailChanged(ev: React.FormEvent<HTMLInputElement>)
    {
        this.setState({inviteEmail: ev.currentTarget.value})
    }

    private _handleSendInviteClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        api.libraries.inviteMember({slug: this.props.slug, email: this.state.inviteEmail})
    }

    private _handleMemberRoleChanged(ev: React.FormEvent<HTMLSelectElement>, userID: number)
    {
        api.libraries.updateMemberRole({slug: this.props.slug, userID, role: ev.currentTarget.value as any})
    }

    public render()
    {
        return (
            <Page>
                <PageHeader icon='cog' title='Library Settings'/>
                <PageBody>
                    <ul className='nav  nav-tabs'>
                        <li className='nav-item'>
                            <a className={this.state.tab === 'Settings' ? 'nav-link active' : 'nav-link'} onClick={() => this.setState({tab: 'Settings'})}>Settings</a>
                        </li>
                        <li className='nav-item'>
                            <a className={this.state.tab === 'Members' ? 'nav-link active' : 'nav-link'} onClick={() => this.setState({tab: 'Members'})}>Members</a>
                        </li>
                    </ul>
                    {this.state.tab === 'Settings' && (
                        <div>
                            <div className='form-group mt-sm-2'>
                                <label htmlFor='title'>Title</label>
                                <input type='text' className='form-control' name='title' disabled={this.state.status !== Status.Idle} value={this.state.title} onChange={ev => this._handleTitleChanged(ev)}/>
                            </div>
                            <div className='form-group mt-sm-2'>
                                <label htmlFor='visbility'>Visibility</label>
                                <div className='btn-group form-control'>
                                    {this.state.visibility === 'Public' && <button id='note-btn-visibility' className='btn btn-info' about='Toggle Visibility' disabled={this.state.status !== Status.Idle} onClick={ev => this._handleVisibilityClicked(ev)}>Public</button>}
                                    {this.state.visibility !== 'Public' && <button id='note-btn-visibility' className='btn btn-light' about='Toggle Visibility' disabled={this.state.status !== Status.Idle} onClick={ev => this._handleVisibilityClicked(ev)}>Hidden</button>}
                                </div>
                            </div>
                            <div className='btn-group float-right mt-sm-2'>
                                <button className='btn btn-primary' disabled={this.state.status !== Status.Idle} onClick={ev => this._handleSaveClicked(ev)}>Save</button>
                            </div>
                        </div>
                    )}
                    {this.state.tab === 'Members' && (
                        <ul className='list-group'>
                            {(this.state.members.map(member => (
                                <li key={member.userID} className='list-group-item mt-sm-2'>
                                    <div className='form-group'>{member.nickname}</div>
                                    <div className='form-group'>
                                        {member.role === 'Owner' ? 'Owner' : (
                                            <select className='form-control mt-sm-2' onChange={ev => this._handleMemberRoleChanged(ev, member.userID)}>
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
                                    <input className='form-control' type='text' name='new-member-email' placeholder='email addres' value={this.state.inviteEmail} onChange={ev => this._handleInviteEmailChanged(ev)}/>
                                </div>
                                <div className='form-group float-right'>
                                    <button className='btn btn-primary' onClick={ev => this._handleSendInviteClicked(ev)}>Send Invite</button>
                                </div>
                            </li>
                        </ul>
                    )}
                </PageBody>
            </Page>
        )
    }
}