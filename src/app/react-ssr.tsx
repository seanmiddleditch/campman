import * as React from 'react'
import {Response} from 'express'
import * as ReactDOMServer from 'react-dom/server'
import {Application} from '../components/application'
import { Routes } from '../components/routes'
import * as shortid from 'shortid'
import {URL} from 'url'
import {API, CharacterData, CampaignData, MediaFile, WikiPageData, ProfileData, AdventureData} from '../types'
import { State, serializeState } from '../state'
import { StaticRouter } from 'react-router'

interface RenderProps
{
    title?: string
}

type Stub<Result> = () => Promise<Result>
function stub<R>(): Stub<R> { return () => {throw new Error('not implemented')} }


const stubAPI: API = {
    showLoginDialog: stub<void>(),
    endSession: stub<void>(),
    saveCharacter: stub<CharacterData>(),
    deleteCharacter: stub<void>(),
    uploadFile: stub<MediaFile>(),
    listFiles: stub<MediaFile[]>(),
    deleteFile: stub<void>(),
    createCampaign: stub<CampaignData>(),
    saveSettings: stub<void>(),
    saveWikiPage: stub<WikiPageData>(),
    deletePage: stub<void>(),
    listProfiles: stub<ProfileData[]>(),
    createAdventure: stub<AdventureData>(),
    updateAdventure: stub<AdventureData>(),
    deleteAdventure: stub<void>(),
}

const makeConfig = (resLocals: any, appLocals: any) => ({
    publicURL: new URL(appLocals.config.publicURL) as any,
    campaign: resLocals.campaign
})

type ComponentType<P = {}> = React.ComponentClass<P>|React.StatelessComponent<P>

export function render<Props, Component extends ComponentType<any>>(res: Response, component: Component, props: Props)
{
    const config = makeConfig(res.locals, res.app.locals)
    const profile: ProfileData|undefined = res.locals.profile
    const campaign: CampaignData|undefined = res.locals.campaign
    const initialState: State = {config, profile, campaign, campaigns: new Map<number, CampaignData>()}
    const content = ReactDOMServer.renderToString(<Application api={stubAPI} initialState={initialState}>{React.createElement(component, props)}</Application>)
    res.render('react', {content, props, component: component.name})
}

const emptyState = {
    campaigns: new Map<number, CampaignData>()
}

export function renderMain(res: Response, state: Partial<State>)
{
    const config = makeConfig(res.locals, res.app.locals)
    const profile: ProfileData|undefined = res.locals.profile
    const campaign: CampaignData|undefined = res.locals.campaign
    const initialState: State = {config, profile, campaign, ...emptyState, ...state}

    const ctx = {}
    const content = ReactDOMServer.renderToString(
        <StaticRouter context={ctx} location={res.location}>
            <Application api={stubAPI} initialState={initialState}>
                <Routes/>
            </Application>
        </StaticRouter>
    )
    res.render('react-main', {content, initialState: serializeState(initialState)})
}