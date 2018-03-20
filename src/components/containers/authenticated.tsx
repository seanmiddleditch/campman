import * as React from 'react'
import { StateConsumer, SetState } from '../state-context'
import { APIConsumer } from '../api-context'
import { ProfileData } from '../../types'
import { API } from '../../types'
import { State } from '../../state'

type AuthenticatedRender = (data: {profile?: ProfileData, login: () => void, logout: () => void}) => React.ReactNode

interface Props
{
    render: AuthenticatedRender
}

interface PropsWithAPI extends Props
{
    api: API
    state: State
    setState: SetState
}
class Container extends React.Component<PropsWithAPI>
{
    private _login()
    {
        this.props.api.showLoginDialog().then(profile => this.props.setState(state => ({...state, profile})))
    }

    private _logout()
    {
        this.props.api.endSession().then(() => this.props.setState(state => ({...state, profile: undefined})))
    }

    public render()
    {
        if (this.props.render)
            return this.props.render({profile: this.props.state.profile, login: () => this._login(), logout: () => this._logout()}) || <div/>
        else if (this.props.children)
            return this.props.children
        else
            return <div/>
    }
}

export const Authenticated: React.SFC<Props> = props => <StateConsumer render={(state, setState) => <APIConsumer render={api => <Container api={api} state={state} setState={setState} {...props}/>}/>}/>