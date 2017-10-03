import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {Route, MemoryRouter, Switch, Redirect} from 'react-router'
import {BrowserRouter, NavLink} from 'react-router-dom'

import * as api from './api'
import {AppContainer} from './components/app-container'

import {NotFoundPage} from './pages/not-found'
import {SearchPage} from './pages/search'
import {ViewNotePage} from './pages/view-note'
import {EditNotePage} from './pages/edit-note'
import {MediaBrowserPage} from './pages/media-browser'
import {MyProfilePage} from './pages/my-profile'
import {ListLabelsPage} from './pages/list-labels'
import {ListLibrariesPage} from './pages/list-libraries'
import {ListNotesPage} from './pages/list-notes'

import {Config, User, Library} from './types'

const LibraryRoutes = () => (
    <Switch>
        <Route path='/notes' exact render={p => <ListNotesPage labels={(new URLSearchParams(p.location.search)).get('label')} {...p}/>}/>
        <Route path='/labels' exact>
            <ListLabelsPage/>
        </Route>
        <Route path='/search' exact render={p => <SearchPage {...p} query={(new URLSearchParams(p.location.search)).get('q')}/>}/>
        <Route path='/media/:path*' render={p => <MediaBrowserPage path={p.match.params.path} {...p}/>}/>
        <Route path='/n/:slug' exact render={p => <ViewNotePage slug={p.match.params.slug} {...p}/>}/>
        <Route path='/n/:slug/edit' exact render={p => <EditNotePage slug={p.match.params.slug} {...p}/>}/>
        <Route path='/' exact>
            <ViewNotePage slug='home'/>
        </Route>
        <Route>
            <NotFoundPage/>
        </Route>
    </Switch>
)

const AppRoutes = (props: {config: Config, user: User}) =>
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

const Routes = (props: {config: Config, library: Library, user: User}) => 
    <BrowserRouter>
        <AppContainer user={props.user} config={props.config} library={props.library}>
            {props.library ? <LibraryRoutes/> : <AppRoutes config={props.config} user={props.user}/>}
        </AppContainer>
    </BrowserRouter>

(() => {
    const session = (window as any).CM_SESSION;
    const config = session.config;
    const user = session.user;
    const library = session.library;

    api.auth.configure(config.publicURL);

    ReactDOM.render(<Routes config={config} user={user} library={library}/>, document.getElementById('content'));
})()
