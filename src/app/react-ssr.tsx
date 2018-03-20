import * as React from 'react'
import { Request, Response } from 'express'
import * as ReactDOMServer from 'react-dom/server'
import {Application} from '../components/application'
import { Routes } from '../components/routes'
import * as shortid from 'shortid'
import {URL} from 'url'
import { createLocation } from 'history'
import {API, CharacterData, CampaignData, MediaFile, WikiPageData, ProfileData, AdventureData} from '../types'
import { State, serializeState } from '../state'
import { StaticRouter, Route } from 'react-router'

interface RenderProps
{
    title?: string
}

type Stub<Result> = () => Promise<Result>
function stub<R>(): Stub<R> { return () => {throw new Error('not implemented')} }


const stubAPI: API = {
    showLoginDialog: stub<ProfileData|undefined>(),
    endSession: stub<void>(),
    saveCharacter: stub<CharacterData>(),
    deleteCharacter: stub<void>(),
    uploadFile: stub<MediaFile>(),
    listFiles: stub<MediaFile[]>(),
    deleteFile: stub<void>(),
    createCampaign: stub<CampaignData>(),
    saveSettings: stub<void>(),
    listCampaigns: stub<CampaignData[]>(),
    saveWikiPage: stub<WikiPageData>(),
    deletePage: stub<void>(),
    listProfiles: stub<ProfileData[]>(),
    createAdventure: stub<AdventureData>(),
    updateAdventure: stub<AdventureData>(),
    deleteAdventure: stub<void>(),
}

const makeConfig = (resLocals: any, appLocals: any) => ({
    publicURL: new URL(appLocals.config.publicURL) as any
})

type ComponentType<P = {}> = React.ComponentClass<P>|React.StatelessComponent<P>

export function render<Props, Component extends ComponentType<any>>(res: Response, component: Component, props: Props)
{
    const config = makeConfig(res.locals, res.app.locals)
    const profile: ProfileData|undefined = res.locals.profile
    const campaign: CampaignData|undefined = res.locals.campaign
    const initialState: State = {config, profile, campaign, campaigns: new Map<number, CampaignData>()}
    const location = createLocation('/')

    const ctx = {}
    const content = ReactDOMServer.renderToString(
        <StaticRouter context={ctx} location={location}>
            <Route match='/' render={({location}) =>
                <Application api={stubAPI} initialState={initialState} location={location}>
                    {React.createElement(component, props)}
                </Application>
            }/>
        </StaticRouter>
    )
    res.render('react', {content, props, component: component.name})
}

const emptyState = {
    campaigns: new Map<number, CampaignData>()
}

export function renderMain(req: Request, res: Response, state: Partial<State>)
{
    const config = makeConfig(res.locals, res.app.locals)
    const profile: ProfileData|undefined = res.locals.profile
    const campaign: CampaignData|undefined = res.locals.campaign
    const initialState: State = {config, profile, campaign, ...emptyState, ...state}

    const ctx = {}
    const content = ReactDOMServer.renderToString(
        <StaticRouter context={ctx} location={req.url}>
            <Route match='/' render={({location}) =>
                <Application api={stubAPI} initialState={initialState} location={location}>
                    <Routes location={location}/>
                </Application>
            }/>
        </StaticRouter>
    )
    res.render('react-main', {content, initialState: serializeState(initialState)})
}