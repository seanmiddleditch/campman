import * as React from 'react'

import {Page, PageHeader, PageBody} from '../../components/page'

import * as api from '../../api'
import {User} from '../../types'

interface AcceptInvitationPageProps
{
    code: string
    user?: User
}
export class AcceptInvitationPage extends React.Component<AcceptInvitationPageProps>
{
    constructor(props: AcceptInvitationPageProps)
    {
        super(props)
    }

    private _handleAcceptClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        api.libraries.acceptInvite({code: this.props.code})
            .then(() => alert('accepted!'))
    }

    public render()
    {
        return (
            <Page>
                <PageHeader icon='cog' title='Invigation to Join Campaign'/>
                <PageBody>
                    {this.props.user ? (
                        <button className='btn btn-primary' onClick={ev => this._handleAcceptClicked(ev)}>Accept Invitation</button>
                    ) : (
                        <div>Please Login to continue</div>
                    )}
                </PageBody>
            </Page>
        )
    }
}