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
import NavBar from './components/NavBar';
import Footer from './components/Footer';

import Routes from './routes';

interface AppProps
{
    user?: User;
    gateway: ClientGateway;
}
interface AppState
{
    user?: User;
}
class App extends React.Component<AppProps, AppState>
{
    private _gateway: ClientGateway;

    constructor(props: AppProps)
    {
        super(props);
        this.state = {
            user: props.user
        };
    }

    private _onLogin()
    {
        this._gateway.login().then(user => this.setState({user: user}));
    }

    private _onLogout()
    {
        this._gateway.logout().then(() => this.setState({user: null}));
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
                    <Routes gateway={this.props.gateway}/>
                </div>
                <Footer/>
           </div>
        </BrowserRouter>;
    }
}

const gateway = new ClientGateway();
gateway.retrieveAuth().then(session => {
    ReactDOM.render(<App gateway={gateway} user={(session && session.user) || null}/>, document.getElementById('content'));
});