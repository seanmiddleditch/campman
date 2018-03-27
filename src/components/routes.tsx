import * as React from 'react'
import { Location } from 'history'
import { Router, Route, Switch, Redirect } from 'react-router'
import {
    NotFound,
    ListCampaigns,
    NewCampaign,
    SiteHome,
    JoinCampaign,
    ListAdventures,
    NewAdventure,
    ViewAdventure,
    CampaignMembership
} from './pages'

export const MainRoutes: React.SFC<{location: Location}> = ({location, children}) =>
    <Switch location={location}>
        <Route exact path='/'>
            <SiteHome/>
        </Route>
        <Route exact path='/campaigns'>
            <ListCampaigns/>
        </Route>
        <Route exact path='/new-campaign'>
            <NewCampaign/>
        </Route>
        <Route exact path='/join/:code'>
            <JoinCampaign/>
        </Route>
        {children && <Route path='/'>{children}</Route>}
        <Route status={404} component={NotFound}/>
    </Switch>

export const CampaignRoutes: React.SFC<{location: Location}> = ({location, children}) =>
    <Switch location={location}>
        <Route exact path='/'>
            <Redirect to='/wiki/p/home'/>
        </Route>
        <Route exact path='/adventures/:id' render={({match}) =>
            <ViewAdventure id={match.params['id']}/>
        }/>
        <Route exact path='/adventures'>
            <ListAdventures/>
        </Route>
        <Route exact path='/new-adventure'>
            <NewAdventure/>
        </Route>
        {/* <Route exact path='/wiki'>
        </Route>
        <Route exact path='/characters'>
        </Route>
        <Route exact path='/files'>
        </Route>
        <Route exact path='/settings'>
        </Route>
        <Route exact path='/membership'>
            <Redirect to='/membership'/>
        </Route>
        <Route exact path='/maps'>
            <Redirect to='/maps'/>
        </Route> */}
        {children && <Route path='/'>{children}</Route>}
        <Route status={404} component={NotFound}/>
    </Switch>