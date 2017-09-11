import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Route, MemoryRouter, Switch, Redirect } from 'react-router';
import { BrowserRouter, NavLink } from 'react-router-dom';

import ClientGateway from './common/ClientGateway';

import NotePage from './components/NotePage';
import NotesPage from './components/NotesPage';
import LabelPage from './components/LabelPage';
import LabelsPage from './components/LabelsPage';
import NotFoundPage from './components/NotFoundPage';

const gateway = new ClientGateway();

const Navigation = () => <div className='nav-container'><nav className='nav'>
        <NavLink className='nav-link' activeClassName='nav-link-active' to='/n/home' exact>Home</NavLink>
        <NavLink className='nav-link' activeClassName='nav-link-active' to='/notes' isActive={(m, l) => !!m || (l.pathname != '/n/home' && l.pathname.startsWith('/n/'))}>Notes</NavLink>
        <NavLink className='nav-link' activeClassName='nav-link-active' to='/labels' isActive={(m, l) => !!m || l.pathname.startsWith('/l/')}>Labels</NavLink>
    </nav></div>;

const Header = () => <div className='header-container'><header></header></div>;

const Footer = () => <div className='footer-container'><footer><div className='footer-copyright'>Copyright (C) 2017 Sean Middleditch</div></footer></div>;

ReactDOM.render(<BrowserRouter>
    <div id='root'>
        {Header()}
        <div className='content content-container'>
            <Switch>
                <Route path='/notes' exact render={props => <NotesPage gateway={gateway} {...props}/>}/>
                <Route path='/labels' exact render={props => <LabelsPage gateway={gateway} {...props}/>}/>
                <Route path='/n/:slug' exact render={props => <NotePage gateway={gateway} slug={props.match.params.slug} {...props}/>}/>
                <Route path='/l/:slug' exact render={props => <LabelPage gateway={gateway} slug={props.match.params.slug} {...props}/>}/>
                <Redirect path='/' exact to='/n/home'/>
                <Route component={NotFoundPage}/>
            </Switch>
        </div>
        {Navigation()}
        {Footer()}
    </div>
</BrowserRouter>, document.getElementById('content'));