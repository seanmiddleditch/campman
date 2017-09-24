import * as React from 'react';

import * as api from '../api/index';

export interface ProfileViewProps
{
    user: api.UserData
}
export default class ProfileView extends React.Component<ProfileViewProps>
{
    constructor(props: ProfileViewProps)
    {
        super(props);
    }

    render()
    {
        return (
            <div>
                <div className='page-header'>
                    <h1><i className='fa fa-user'></i> My Profile</h1>
                </div>
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
            </div>
        );
    }
}