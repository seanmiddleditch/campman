import * as React from 'react'
import * as history from 'history'
import { Router, Route, Switch } from 'react-router'
import { NotFound, ListCampaigns } from './pages'

export const Routes: React.SFC<{}> = () =>
    <Switch>
        <Route exact match='/campaigns' component={ListCampaigns}/>
        <Route component={NotFound}/>
    </Switch>