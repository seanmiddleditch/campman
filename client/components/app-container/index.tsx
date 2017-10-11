import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as PropTypes from 'prop-types'

import * as api from '../../api'
import {Config, User, Library} from '../../types'

import {NavigationBar} from './components/navigation-bar'

require('./styles/site.css')

export interface AppContainerProps
{
    config: Config
    library?: Library
    user?: User
    children: any
}
interface AppContainerState
{
    user?: User
}
export class AppContainer extends React.Component<AppContainerProps, AppContainerState>
{
    constructor(props: AppContainerProps)
    {
        super(props);
        this.state = {user: props.user}
    }

    private _onLogin()
    {
        api.auth.login()
            .then(user => this.setState({user}))
            .catch(err => console.error(err, err.stack))
    }

    private _onLogout()
    {
        api.auth.logout()
            .then(() => this.setState({user: undefined}))
            .catch(err => console.error(err, err.stack))
    }

    render()
    {
        return (
            <div className='content-wrapper'>
                <NavigationBar config={this.props.config} library={this.props.library} user={this.state.user} onLogout={() => this._onLogout()} onLogin={() => this._onLogin()}/>
                <div className='content'>
                    {this.props.children}
                </div>
                <footer>
                    <div className='footer-copyright'><a href="https://github.com/seanmiddleditch/campman">Campaign Manager</a> by <a href="http://seanmiddleditch.com">Sean Middleditch</a></div>
                </footer>
            </div>
        )
    }
}