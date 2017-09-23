import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Route, MemoryRouter, Switch, Redirect} from 'react-router';
import {BrowserRouter, NavLink} from 'react-router-dom';

import App from './components/app/index';
import NotFoundPage from './components/not-found';

import NoteView from './views/note';
import NotesView from './views/notes';
import MediaView from './views/media';
import SearchPage from './views/search';
import LabelView from './views/label';
import LabelsView from './views/labels';
import LibrariesView from './views/libraries';

import * as api from './api/index';

const Routes = (props: {config: any, library: api.LibraryData, user: api.UserData}) => <BrowserRouter>
    <App user={props.user}>
        <Switch>
            <Route path='/libraries' exact render={p => <LibrariesView config={props.config} {...p}/>}/>
            <Route path='/notes' exact render={p => <NotesView {...p}/>}/>
            <Route path='/search' exact render={p => <SearchPage {...p} query={(new URLSearchParams(p.location.search)).get('q')}/>}/>
            <Route path='/labels' exact render={p => <LabelsView {...p}/>}/>
            <Route path='/media/:path*' render={p => <MediaView path={p.match.params.path} {...p}/>}/>
            <Route path='/n/:slug' exact render={p => <NoteView slug={p.match.params.slug} {...p}/>}/>
            <Route path='/l/:slug' exact render={p => <LabelView slug={p.match.params.slug} {...p}/>}/>
            {props.library ? <Redirect to='/n/home'/> : <Redirect to='/libraries'/>}
            <Route component={NotFoundPage}/>
        </Switch>
    </App>
</BrowserRouter>;

(() => {
    const session = (window as any).CM_SESSION;
    const config = session.config;
    const user = session.user;
    const library = session.library;
    ReactDOM.render(<Routes config={config} user={user} library={library}/>, document.getElementById('content'));
})();
