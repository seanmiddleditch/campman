import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as PropTypes from 'prop-types'

import * as api from '../../api'
import {Config} from '../../client'

import NavigationBar from './navigation-bar'

require('../../styles/site.css')

export interface AppProps
{
    config: Config
    library?: api.LibraryData
    user?: api.UserData
    children: any
}
interface AppState
{
    user?: api.UserData
}
export default class App extends React.Component<AppProps, AppState>
{
    constructor(props: AppProps)
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

    private _onSearch(text: string)
    {
        alert(text);
    }

    render()
    {
        return (
            <div className='content-wrapper'>
                <NavigationBar config={this.props.config} library={this.props.library} user={this.state.user} onLogout={() => this._onLogout()} onLogin={() => this._onLogin()} onSearch={text => this._onSearch(text)}/>
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