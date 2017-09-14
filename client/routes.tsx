import * as React from 'react';
import {Route, Switch, Redirect} from 'react-router';

import ClientGateway from './common/ClientGateway';

import NotePage from './components/NotePage';
import NotesPage from './components/NotesPage';
import LabelPage from './components/LabelPage';
import LabelsPage from './components/LabelsPage';
import NotFoundPage from './components/NotFoundPage';

export interface RoutesProps
{
    gateway: ClientGateway
}
const Routes = ({gateway}: RoutesProps) => <Switch>
    <Route path='/notes' exact render={props => <NotesPage gateway={gateway} {...props}/>}/>
    <Route path='/labels' exact render={props => <LabelsPage gateway={gateway} {...props}/>}/>
    <Route path='/n/:slug' exact render={props => <NotePage gateway={gateway} slug={props.match.params.slug} {...props}/>}/>
    <Route path='/l/:slug' exact render={props => <LabelPage gateway={gateway} slug={props.match.params.slug} {...props}/>}/>
    <Redirect path='/' exact to='/n/home'/>
    <Route component={NotFoundPage}/>
</Switch>;

export default Routes;