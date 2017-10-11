import * as React from 'react'

import {User} from '../../types'
import * as api from '../../api'

import {Page, PageHeader, PageBody} from '../../components/page'

export interface MyProfilePageProps
{
    user: User
}
interface MyProfilePageState
{
    nickname: string
    saving?: boolean
}
export class MyProfilePage extends React.Component<MyProfilePageProps, MyProfilePageState>
{
    constructor(props: MyProfilePageProps)
    {
        super(props)
        this.state = {nickname: props.user.nickname}
    }

    private _handleNicknameChange(ev: React.ChangeEvent<HTMLInputElement>)
    {
        this.setState({nickname: ev.currentTarget.value})
    }

    private _handleSaveClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        if (!this.state.saving)
        {
            this.setState({saving: true})
            api.auth.updateProfile({nickname: this.state.nickname})
                .then(() => this.setState({saving: false}))
                .catch(err => {
                    console.error(err, err.stack)
                    this.setState({saving: false})
                })
        }
    }

    render()
    {
        return (
            <Page>
                <PageHeader icon='user' title='MyProfile'/>
                <PageBody>
                    <div className='form-group mt-sm-2'>
                        <label htmlFor='fullname'>Full name</label>
                        <input type='text' disabled className='form-control' name='fullname' value={this.props.user.fullName}/>
                    </div>
                    <div className='form-group mt-sm-2'>
                    <label htmlFor='email'>Email address</label>
                        <input type='text' disabled className='form-control' name='email' value={this.props.user.email}/>
                    </div>
                    <div className='form-group mt-sm-2'>
                        <label htmlFor='nickname'>Nickname</label>
                        <input type='text' className='form-control' name='email' disabled={this.state.saving} placeholder='Personal nickname' value={this.state.nickname} onChange={ev => this._handleNicknameChange(ev)}/>
                    </div>
                    <div className='btn-group float-right mt-sm-2'>
                        <button className='btn btn-primary' disabled={this.state.saving} onClick={ev => this._handleSaveClicked(ev)}>Save</button>
                    </div>
                </PageBody>
            </Page>
        )
    }
}