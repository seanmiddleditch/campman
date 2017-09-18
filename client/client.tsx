import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Route, MemoryRouter, Switch, Redirect} from 'react-router';
import {BrowserRouter, NavLink} from 'react-router-dom';

import User from './common/User';
import App from './components/App/index';

import NotePage from './components/NoteView/index';
import NotesPage from './components/NotesPage';
import LabelPage from './components/LabelPage';
import LabelsPage from './components/LabelsPage';
import SearchPage from './components/SearchPage';
import LibrariesPage from './components/LibrariesPage';
import NotFoundPage from './components/NotFoundPage';

import ClientGateway, {Library} from './common/ClientGateway';

const Routes = (props: {gateway: ClientGateway, library: Library, user: User}) => <BrowserRouter>
    <App gateway={props.gateway} library={props.library}>
        <Switch>
            <Route path='/libraries' exact render={p => <LibrariesPage gateway={props.gateway} {...p}/>}/>
            <Route path='/notes' exact render={p => <NotesPage library={props.library} {...p}/>}/>
            <Route path='/search' exact render={p => <SearchPage gateway={props.gateway} {...p} query={(new URLSearchParams(p.location.search)).get('q')}/>}/>
            <Route path='/labels' exact render={p => <LabelsPage library={props.library} {...p}/>}/>
            <Route path='/n/:slug' exact render={p => <NotePage library={props.library} slug={p.match.params.slug} {...p}/>}/>
            <Route path='/l/:slug' exact render={p => <LabelPage library={props.library} slug={p.match.params.slug} {...p}/>}/>
            <Redirect path='/' exact to={props.user ? '/n/home' : '/libraries'}/>
            <Route component={NotFoundPage}/>
        </Switch>
    </App>
</BrowserRouter>;

(() => {
    const gateway = new ClientGateway();
    const session = (window as any).CM_SESSION;
    const user = session ? session.user as User : null;
    const library = session ? new Library(gateway.helper, session.library) : null;
    ReactDOM.render(<Routes gateway={gateway} user={user} library={library}/>, document.getElementById('content'));
})();
