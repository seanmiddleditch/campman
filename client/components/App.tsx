import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Route, MemoryRouter, Switch, Redirect} from 'react-router';
import {BrowserRouter, NavLink} from 'react-router-dom';

import ClientGateway, {Library} from '../common/ClientGateway';
import User from '../common/User';

import NavBar from './NavBar';
import Footer from './Footer';

import NotePage from './NotePage';
import NotesPage from './NotesPage';
import LabelPage from './LabelPage';
import LabelsPage from './LabelsPage';
import LibrariesPage from './LibrariesPage';
import NotFoundPage from './NotFoundPage';

export interface AppProps
{
    user?: User;
    gateway: ClientGateway;
    library: Library;
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
        this.props.gateway.login().then(user => this.setState({user: user}));
    }

    private _onLogout()
    {
        this.props.gateway.logout().then(() => this.setState({user: null}));
    }

    private _onSearch(text: string)
    {
        alert(text);
    }

    render()
    {
        return <BrowserRouter>
            <div className='content-wrapper'>
                <NavBar user={this.state.user} onLogout={() => this._onLogout()} onLogin={() => this._onLogin()} onSearch={text => this._onSearch(text)}/>
                <div className='content'>
                    <Switch>
                        <Route path='/libraries' exact render={props => <LibrariesPage gateway={this.props.gateway} {...props}/>}/>
                        <Route path='/notes' exact render={props => <NotesPage library={this.props.library} {...props}/>}/>
                        <Route path='/labels' exact render={props => <LabelsPage library={this.props.library} {...props}/>}/>
                        <Route path='/n/:slug' exact render={props => <NotePage library={this.props.library} slug={props.match.params.slug} {...props}/>}/>
                        <Route path='/l/:slug' exact render={props => <LabelPage library={this.props.library} slug={props.match.params.slug} {...props}/>}/>
                        <Redirect path='/' exact to='/n/home'/>
                        <Route component={NotFoundPage}/>
                    </Switch>
                </div>
                <Footer/>
           </div>
        </BrowserRouter>;
    }
}