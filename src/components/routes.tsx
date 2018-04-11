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
    EditAdventure,
    ViewAdventure,
    CampaignMembership,
    ListCharacters,
    ListWiki,
    ListMaps
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
        <Route exact path='/adventures/:id/edit' render={({match}) =>
            <EditAdventure id={match.params['id']}/>
        }/>
        <Route exact path='/adventures/:id' render={({match}) =>
            <ViewAdventure id={match.params['id']}/>
        }/>
        <Route exact path='/adventures'>
            <ListAdventures/>
        </Route>
        <Route exact path='/new-adventure'>
            <NewAdventure/>
        </Route>
        <Route exact path='/chars'>
            <ListCharacters/>
        </Route>
        <Route exact path='/wiki'>
            <ListWiki/>
        </Route>
        <Route exact path='/maps'>
            <ListMaps/>
        </Route>
        {/* <Route exact path='/files'>
        </Route>
        <Route exact path='/settings'>
        </Route>
        <Route exact path='/membership'>
            <Redirect to='/membership'/>
        </Route>
         */}
        {children && <Route path='/'>{children}</Route>}
        <Route status={404} component={NotFound}/>
    </Switch>