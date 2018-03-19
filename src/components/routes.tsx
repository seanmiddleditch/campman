import * as React from 'react'
import { Location } from 'history'
import { Router, Route, Switch } from 'react-router'
import { NotFound, ListCampaigns, NewCampaign, SiteHome, JoinCampaign } from './pages'

export const Routes: React.SFC<{location: Location}> = ({location}) =>
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
        <Route status={404} component={NotFound}/>
    </Switch>