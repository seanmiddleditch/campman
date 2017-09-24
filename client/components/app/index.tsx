import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as PropTypes from 'prop-types';

import * as api from '../../api/index';
import {Config} from '../../client';

import NavigationBar from './navigation-bar';

require('../../styles/site.css');

export interface AppProps
{
    config: Config;
    library?: api.LibraryData;
    user?: api.UserData;
    children: any;
}
export default class App extends React.Component<AppProps>
{
    constructor(props: AppProps)
    {
        super(props);
    }

    private _onLogin()
    {
        api.auth.login().then(() => window.location.reload(true));
    }

    private _onLogout()
    {
        api.auth.logout().then(() => window.location.reload(true));
    }

    private _onSearch(text: string)
    {
        alert(text);
    }

    render()
    {
        //(new URLSearchParams(window.location.search)).get('q')
        return (
            <div className='content-wrapper'>
                <NavigationBar config={this.props.config} library={this.props.library} user={this.props.user} onLogout={() => this._onLogout()} onLogin={() => this._onLogin()} onSearch={text => this._onSearch(text)}/>
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