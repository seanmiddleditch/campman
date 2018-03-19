import * as React from 'react'
import { createBrowserHistory, History } from 'history'
import { Router, Route, Switch } from 'react-router'
import { State } from '../state'
import { API } from '../types'
import { Application } from './application'
import { Routes } from './routes'

interface Props
{
    api: API
    initialState: State
}
export const Main: React.SFC<Props> = ({api, initialState}) =>
    <Router history={createBrowserHistory()}>
        <Route match='/' render={({location}) =>
            <Application api={api} initialState={initialState} location={location}>
                <Routes location={location}/>
            </Application>
        }/>
    </Router>
