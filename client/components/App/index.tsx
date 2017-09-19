import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as PropTypes from 'prop-types';

import ClientGateway, {Library} from '../../common/gateway';
import User from '../../common/user';

import NavigationBar from './navigation-bar';
import PageFooter from './page-footer';

export interface AppProps
{
    user?: User;
    gateway: ClientGateway;
    library: Library;
    children: any;
}
interface AppState
{
    user?: User;
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
        this.props.gateway.login().then(() => window.location.reload(true));
    }

    private _onLogout()
    {
        this.props.gateway.logout().then(() => window.location.reload(true));
    }

    private _onSearch(text: string)
    {
        alert(text);
    }

    render()
    {
        //(new URLSearchParams(window.location.search)).get('q')
        return <div className='content-wrapper'>
            <NavigationBar user={this.state.user} onLogout={() => this._onLogout()} onLogin={() => this._onLogin()} onSearch={text => this._onSearch(text)}/>
            <div className='content'>
                {this.props.children}
            </div>
            <PageFooter/>
        </div>;
    }
}