import * as React from 'react'
import {Route, NavLink} from 'react-router-dom'

import {Page, PageHeader, PageBody} from '../../components/page'

import * as api from '../../api'

import {SettingsTab} from './components/settings-tab'
import {MembersTab} from './components/members-tab'

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
    members: {id: number, role: string, nickname: string}[]
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
                .then(settings => {
                    this.setState(settings)
                    api.libraries.fetchMembers({slug: this.props.slug})
                        .then(members => this.setState({members, status: Status.Idle}))
                        .catch(e => this.setState({status: Status.Idle}))
                })
                .catch(e => this.setState({status: Status.Idle}))
        }
    }

    componentDidMount()
    {
        this._fetch()
    }

    private _handleTitleChanged(title: string)
    {
        this.setState({title})
    }

    private _handleVisibilityClicked(visibility: 'Public'|'Hidden')
    {
        this.setState({visibility})
    }

    private _handleSaveClicked()
    {
        if (this.state.status === Status.Idle)
        {
            this.setState({status: Status.Saving})
            api.libraries.saveSettings({slug: this.props.slug, title: this.state.title, visibility: this.state.visibility})
                .then(() => this.setState({status: Status.Idle}))
                .catch(() => this.setState({status: Status.Idle}))
        }
    }

    private _handleInviteEmailChanged(inviteEmail: string)
    {
        this.setState({inviteEmail})
    }

    private _handleSendInviteClicked(email: string)
    {
        alert(email)
        this.setState({status: Status.Saving})
        api.libraries.inviteMember({slug: this.props.slug, email})
            .then(() => this.setState({status: Status.Idle, inviteEmail: ''}))
            .catch(err => this.setState({status: Status.Idle}))
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
                            <NavLink className='nav-link' activeClassName='active' to='/settings' exact>Settings</NavLink>
                        </li>
                        <li className='nav-item'>
                            <NavLink className='nav-link' activeClassName='active' to='/settings/members'>Members</NavLink>
                        </li>
                    </ul>
                    <Route path='/settings' exact render={p => <SettingsTab
                        disabled={this.state.status !== Status.Idle}
                        title={this.state.title}
                        visibility={this.state.visibility}
                        onTitleChange={title => this._handleTitleChanged(title)}
                        onVisibilityChanged={vis => this._handleVisibilityClicked(vis)}
                        onSaveClicked={() => this._handleSaveClicked()}
                    />}/>
                    <Route path='/settings/members' render={p => <MembersTab
                        disabled={this.state.status !== Status.Idle}
                        members={this.state.members}
                        inviteEmail={this.state.inviteEmail}
                        inviteEmailChanged={email => this._handleInviteEmailChanged(email)}
                        sendInvite={email => this._handleSendInviteClicked(email)}
                    />}/>
                </PageBody>
            </Page>
        )
    }
}