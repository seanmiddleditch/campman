import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Route, MemoryRouter, Switch, Redirect} from 'react-router';
import {BrowserRouter, NavLink} from 'react-router-dom';

import User from './common/user';
import App from './components/app/index';
import NotFoundPage from './components/not-found';

import NoteView from './views/note';
import NotesView from './views/notes';
import HomeView from './views/home';
import MediaView from './views/media';
import SearchPage from './views/search';
import LabelView from './views/label';
import LabelsView from './views/labels';
import LibrariesView from './views/libraries';

import ClientGateway, {Library} from './common/gateway';

const Routes = (props: {gateway: ClientGateway, library: Library, user: User}) => <BrowserRouter>
    <App gateway={props.gateway} library={props.library}>
        <Switch>
            <Route path='/libraries' exact render={p => <LibrariesView gateway={props.gateway} {...p}/>}/>
            <Route path='/notes' exact render={p => <NotesView library={props.library} {...p}/>}/>
            <Route path='/search' exact render={p => <SearchPage gateway={props.gateway} {...p} query={(new URLSearchParams(p.location.search)).get('q')}/>}/>
            <Route path='/labels' exact render={p => <LabelsView library={props.library} {...p}/>}/>
            <Route path='/media' exact render={p => <MediaView {...p}/>}/>
            <Route path='/n/:slug' exact render={p => <NoteView library={props.library} slug={p.match.params.slug} {...p}/>}/>
            <Route path='/l/:slug' exact render={p => <LabelView library={props.library} slug={p.match.params.slug} {...p}/>}/>
            <Route path='/' exact render={p => <HomeView/>}/>
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
