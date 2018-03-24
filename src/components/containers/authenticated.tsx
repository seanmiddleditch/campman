import * as React from 'react'
import { StateConsumer } from '../state-context'
import { APIConsumer } from '../api-context'
import { ProfileData } from '../../types'
import { API } from '../../types'
import { State } from '../../state'

type Render = (data: {profile?: ProfileData, login: () => void, logout: () => void}) => React.ReactNode

type Props = {render: Render, children?: never}|{render?: never, children: Render}

type PropsWithAPI = Props&
{
    api: API
    profile?: ProfileData
    setState: (cb: (state: State) => State) => void
}
class Container extends React.Component<PropsWithAPI>
{
    private _login()
    {
        const {setState} = this.props
        this.props.api.showLoginDialog().then(profile => setState(state => ({...state, profile})))
    }

    private _logout()
    {
        const {setState} = this.props
        this.props.api.endSession().then(() => setState(state => ({...state, profile: undefined})))
    }

    public render()
    {
        const {profile, render, children} = this.props
        const renderProps = {profile, login: () => this._login(), logout: () => this._logout()}

        let result: React.ReactNode = undefined
        if (typeof render === 'function')
            result = render(renderProps)
        else if (typeof children === 'function')
            result = children(renderProps)
        else if (children)
            result = children

        return result || <div/>
    }
}

export const Authenticated: React.SFC<Props> = props => <StateConsumer>{({profile}, setState) => <APIConsumer render={api => <Container api={api} profile={profile} setState={setState} {...props}/>}/>}</StateConsumer>