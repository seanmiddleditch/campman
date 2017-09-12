import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Route, MemoryRouter, Switch, Redirect} from 'react-router';
import {BrowserRouter, NavLink} from 'react-router-dom';

import ClientGateway from './common/ClientGateway';

import NotePage from './components/NotePage';
import NotesPage from './components/NotesPage';
import LabelPage from './components/LabelPage';
import LabelsPage from './components/LabelsPage';
import Navigation from './components/Navigation';
import NotFoundPage from './components/NotFoundPage';
import LoginLinks from './components/LoginLinks';

const Header = () => <div className='header-container'><header></header></div>;
const Footer = () => <div className='footer-container'><footer><div className='footer-copyright'>Copyright (C) 2017 Sean Middleditch</div></footer></div>;

interface AppState
{
    sessionKey?: string
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

    private _onLogin(sessionKey: string)
    {
        this.setState({sessionKey});
        this.forceUpdate();
    }

    private _onLogout()
    {
        this.setState({sessionKey: null});
        this.forceUpdate();  
    }

    render()
    {
        return <BrowserRouter>
            <div id='root'>
                {Header()}
                <div className='content content-container'>
                    <Switch>
                        <Route path='/login' exact render={props => <LoginLinks sessionKey={this.state.sessionKey} onLogout={() => this._onLogout()} onLogin={key => this._onLogin(key)}/>}/>
                        <Route path='/notes' exact render={props => <NotesPage gateway={this._gateway} {...props}/>}/>
                        <Route path='/labels' exact render={props => <LabelsPage gateway={this._gateway} {...props}/>}/>
                        <Route path='/n/:slug' exact render={props => <NotePage gateway={this._gateway} slug={props.match.params.slug} {...props}/>}/>
                        <Route path='/l/:slug' exact render={props => <LabelPage gateway={this._gateway} slug={props.match.params.slug} {...props}/>}/>
                        <Redirect path='/' exact to='/n/home'/>
                        <Route component={NotFoundPage}/>
                    </Switch>
                </div>
                <Navigation sessionKey={this.state.sessionKey} onLogout={() => this._onLogout()} onLogin={key => this._onLogin(key)}/>
                {Footer()}
            </div>
        </BrowserRouter>
    }
}

ReactDOM.render(<App/>, document.getElementById('content'));