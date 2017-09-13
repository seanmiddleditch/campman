import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Route, MemoryRouter, Switch, Redirect} from 'react-router';
import {BrowserRouter, NavLink} from 'react-router-dom';

import ClientGateway from './common/ClientGateway';
import User from './common/User';

import NotePage from './components/NotePage';
import NotesPage from './components/NotesPage';
import LabelPage from './components/LabelPage';
import LabelsPage from './components/LabelsPage';
import NotFoundPage from './components/NotFoundPage';
import LoginLinks from './components/LoginLinks';
import NavBar from './components/NavBar';

const Header = () => <div className='header-container'><header></header></div>;
const Footer = () => <div className='footer-container'><footer><div className='footer-copyright'>Copyright (C) 2017 Sean Middleditch</div></footer></div>;

interface AppState
{
    user?: User;
}
class App extends React.Component<{}, AppState>
{
    private _gateway: ClientGateway;

    constructor()
    {
        super();
        this.state = {};
        this._gateway = new ClientGateway();
    }

    private _onLogin()
    {
        this._gateway.login().then(user => this.setState({user: user}));
    }

    private _onLogout()
    {
        this._gateway.logout().then(() => this.setState({user: null}));
    }

    componentWillMount()
    {
        this._gateway.retrieveAuth().then(session => {
            this.setState({user: session.user});
        });
    }

    render()
    {
        return <BrowserRouter>
            <div id='root'>
                <NavBar user={this.state.user} onLogout={() => this._onLogout()} onLogin={() => this._onLogin()}/>
                <Header/>
                <div className='content content-container'>
                    <Switch>
                        <Route path='/login' exact render={props => <LoginLinks user={this.state.user} onLogout={() => this._onLogout()} onLogin={() => this._onLogin()}/>}/>
                        <Route path='/notes' exact render={props => <NotesPage gateway={this._gateway} {...props}/>}/>
                        <Route path='/labels' exact render={props => <LabelsPage gateway={this._gateway} {...props}/>}/>
                        <Route path='/n/:slug' exact render={props => <NotePage gateway={this._gateway} slug={props.match.params.slug} {...props}/>}/>
                        <Route path='/l/:slug' exact render={props => <LabelPage gateway={this._gateway} slug={props.match.params.slug} {...props}/>}/>
                        <Redirect path='/' exact to='/n/home'/>
                        <Route component={NotFoundPage}/>
                    </Switch>
                </div>
                <Footer/>
            </div>
        </BrowserRouter>
    }
}

ReactDOM.render(<App/>, document.getElementById('content'));