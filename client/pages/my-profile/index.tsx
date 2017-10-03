import * as React from 'react'

import {User} from '../../types'

import Page, {PageHeader, PageBody} from '../../components/page'

export interface ProfileViewProps
{
    user: User
}
export class MyProfilePage extends React.Component<ProfileViewProps>
{
    constructor(props: ProfileViewProps)
    {
        super(props)
    }

    render()
    {
        return (
            <Page>
                <PageHeader icon='user' title='MyProfile'/>
                <PageBody>
                    <div className='input-group mt-sm-2'>
                        <span className='input-group-addon'>Full Name</span>
                        <input type='text' disabled className='form-control' name='fullname' value={this.props.user.fullName}/>
                    </div>
                    <div className='input-group mt-sm-2'>
                        <span className='input-group-addon'>Nickname</span>
                        <input type='text' disabled className='form-control' name='email' value={this.props.user.nickname || this.props.user.fullName}/>
                    </div>
                    <div className='input-group mt-sm-2'>
                        <span className='input-group-addon'>@</span>
                        <input type='text' disabled className='form-control' name='email' value={this.props.user.email}/>
                    </div>
                </PageBody>
            </Page>
        )
    }
}