import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Route, MemoryRouter, Switch, Redirect} from 'react-router';
import {BrowserRouter, NavLink} from 'react-router-dom';

import App from './components/app/index';
import NotFoundPage from './components/not-found';

import NoteView from './views/note';
import MediaView from './views/media';
import SearchPage from './views/search';
import LabelView from './views/label';
import LabelsView from './views/labels';
import ProfileView from './views/profile';

import ListLibrariesPage from './pages/list-libraries/index';
import ListNotesPage from './pages/list-notes/index';

import * as api from './api/index';

export interface Config
{
    publicURL: string
}

const LibraryRoutes = () => (
    <Switch>
        <Route path='/notes' exact render={p => <ListNotesPage {...p}/>}/>
        <Route path='/search' exact render={p => <SearchPage {...p} query={(new URLSearchParams(p.location.search)).get('q')}/>}/>
        <Route path='/labels' exact render={p => <LabelsView {...p}/>}/>
        <Route path='/media/:path*' render={p => <MediaView path={p.match.params.path} {...p}/>}/>
        <Route path='/n/:slug' exact render={p => <NoteView slug={p.match.params.slug} {...p}/>}/>
        <Route path='/l/:slug' exact render={p => <LabelView slug={p.match.params.slug} {...p}/>}/>);
        <Route path='/' exact>
            <NoteView slug='home'/>
        </Route>
        <Route component={NotFoundPage}/>
    </Switch>);
const AppRoutes = ({config, user}: {config: Config, user: api.UserData}) => (
    <Switch>
        <Route path='/libraries' exact>
            <ListLibrariesPage config={config}/>
        </Route>
        <Route path='/profile' exact>
            <ProfileView user={user}/>
        </Route>
        <Route path='/' exact>
            <Redirect to='/libraries'/>
        </Route>
        <Route component={NotFoundPage}/>
    </Switch>
);

const Routes = ({config, library, user}: {config: Config, library: api.LibraryData, user: api.UserData}) => <BrowserRouter>
    <App user={user} config={config} library={library}>
        {library ? <LibraryRoutes/> : <AppRoutes config={config} user={user}/>}
    </App>
</BrowserRouter>;

(() => {
    const session = (window as any).CM_SESSION;
    const config = session.config;
    const user = session.user;
    const library = session.library;

    api.auth.configure(config.publicURL);

    ReactDOM.render(<Routes config={config} user={user} library={library}/>, document.getElementById('content'));
})();
