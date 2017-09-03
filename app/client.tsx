import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Route, MemoryRouter, Switch, Redirect } from 'react-router';
import { BrowserRouter, Link } from 'react-router-dom';

import NotePage from './components/NotePage';
import NotesPage from './components/NotesPage';
import LabelPage from './components/LabelPage';
import LabelsPage from './components/LabelsPage';
import NotFoundPage from './components/NotFoundPage';

const Header = () => <nav className="nav flex-column">
        <Link className="nav-link" to="/notes">Notes</Link>
        <Link className="nav-link" to="/labels">Labels</Link>
    </nav>;

const Footer = () => <div className="footer"><div className="footer-copyright">Copyright (C) 2017 Sean Middleditch</div></div>;

ReactDOM.render(<BrowserRouter>
    <div id="root" className="container-fluid">
        <div className="row">
            {Header()}
            <div className="content col-md-8">
                <Switch>
                    <Route path='/notes' exact component={NotesPage}/>
                    <Route path='/labels' exact component={LabelsPage}/>
                    <Route path='/n/:slug' render={(p) => <NotePage slug={p.match.params.slug}/>}/>
                    <Route path='/l/:slug' render={(p) => <LabelPage slug={p.match.params.slug}/>}/>
                    <Redirect path='/' exact to='/n/home'/>
                    <Route component={NotFoundPage}/>
                </Switch>
            </div>
        </div>
        {Footer()}
    </div>
</BrowserRouter>, document.getElementById('content'));