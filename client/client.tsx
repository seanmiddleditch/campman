import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Route, MemoryRouter, Switch, Redirect} from 'react-router';
import {BrowserRouter, NavLink} from 'react-router-dom';

import App from './components/app';
import NotFoundPage from './components/not-found';

import NoteView from './views/note';
import SearchPage from './views/search';
import LabelView from './views/label';

import MediaBrowserPage from './pages/media-browser';
import MyProfilePage from './pages/my-profile';
import ListLabelsPage from './pages/list-labels';
import ListLibrariesPage from './pages/list-libraries';
import ListNotesPage from './pages/list-notes';

import * as api from './api';

export interface Config
{
    publicURL: string
}

const LibraryRoutes = () => (
    <Switch>
        <Route path='/notes' exact>
            <ListNotesPage/>
        </Route>
        <Route path='/labels' exact>
            <ListLabelsPage/>
        </Route>
        <Route path='/search' exact render={p => <SearchPage {...p} query={(new URLSearchParams(p.location.search)).get('q')}/>}/>
        <Route path='/media/:path*' render={p => <MediaBrowserPage path={p.match.params.path} {...p}/>}/>
        <Route path='/n/:slug' exact render={p => <NoteView slug={p.match.params.slug} {...p}/>}/>
        <Route path='/l/:slug' exact render={p => <LabelView slug={p.match.params.slug} {...p}/>}/>);
        <Route path='/' exact>
            <NoteView slug='home'/>
        </Route>
        <Route>
            <NotFoundPage/>
        </Route>
    </Switch>
)

const AppRoutes = (props: {config: Config, user: api.UserData}) =>
    <Switch>
        <Route path='/libraries' exact>
            <ListLibrariesPage config={props.config}/>
        </Route>
        <Route path='/profile' exact>
            <MyProfilePage user={props.user}/>
        </Route>
        <Route path='/' exact>
            <Redirect to='/libraries'/>
        </Route>
        <Route>
            <NotFoundPage/>
        </Route>
    </Switch>

const Routes = (props: {config: Config, library: api.LibraryData, user: api.UserData}) => 
    <BrowserRouter>
        <App user={props.user} config={props.config} library={props.library}>
            {props.library ? <LibraryRoutes/> : <AppRoutes config={props.config} user={props.user}/>}
        </App>
    </BrowserRouter>


(() => {
    const session = (window as any).CM_SESSION;
    const config = session.config;
    const user = session.user;
    const library = session.library;

    api.auth.configure(config.publicURL);

    ReactDOM.render(<Routes config={config} user={user} library={library}/>, document.getElementById('content'));
})();
