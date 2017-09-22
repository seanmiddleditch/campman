import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as PropTypes from 'prop-types';

import * as api from '../../api/index';

import NavigationBar from './navigation-bar';

export interface AppProps
{
    library?: api.LibraryData;
    user?: api.UserData;
    children: any;
}
interface AppState
{
    user?: api.UserData;
}
export default class App extends React.Component<AppProps, AppState>
{
    constructor(props: AppProps)
    {
        super(props);
        this.state = {
            user: props.user
        };
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
        return <div className='content-wrapper'>
            <NavigationBar library={this.props.library} user={this.state.user} onLogout={() => this._onLogout()} onLogin={() => this._onLogin()} onSearch={text => this._onSearch(text)}/>
            <div className='content'>
                {this.props.children}
            </div>
            <footer>
                <div className='footer-copyright'><a href="https://github.com/seanmiddleditch/campman">Campaign Manager</a> by <a href="http://seanmiddleditch.com">Sean Middleditch</a></div>
            </footer>
        </div>;
    }
}