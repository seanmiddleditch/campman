import * as React from 'react'
import { Request, Response } from 'express'
import * as ReactDOMServer from 'react-dom/server'
import { Application } from '../components/application'
import { MainRoutes, CampaignRoutes } from '../components/routes'
import * as shortid from 'shortid'
import { URL } from 'url'
import { API, CharacterData, CampaignData, MediaFile, WikiPageData, ProfileData, AdventureData, MapData } from '../types'
import { State } from '../state'
import { StaticRouter, Route } from 'react-router'
import { config } from './config'

interface RenderProps
{
    title?: string
}

type Stub<Result> = () => Promise<Result>
function stub<R>(): Stub<R> { return () => {throw new Error('not implemented')} }


const stubAPI: API = {
    showLoginDialog: stub<ProfileData|undefined>(),
    endSession: stub<void>(),
    listCharacters: stub<CharacterData[]>(),
    saveCharacter: stub<CharacterData>(),
    deleteCharacter: stub<void>(),
    uploadFile: stub<MediaFile>(),
    listFiles: stub<MediaFile[]>(),
    deleteFile: stub<void>(),
    createCampaign: stub<CampaignData>(),
    saveSettings: stub<void>(),
    listCampaigns: stub<CampaignData[]>(),
    listWikiPages: stub<WikiPageData[]>(),
    saveWikiPage: stub<WikiPageData>(),
    deletePage: stub<void>(),
    listProfiles: stub<ProfileData[]>(),
    listMaps: stub<MapData[]>(),
    listAdventures: stub<AdventureData[]>(),
    fetchAdventure: stub<AdventureData|undefined>(),
    createAdventure: stub<AdventureData>(),
    updateAdventure: stub<AdventureData>(),
    deleteAdventure: stub<void>(),
}

const makeConfig = () => ({
    publicURL: config.publicURL.toString()
})

type ComponentType<P = {}> = React.ComponentClass<P>|React.StatelessComponent<P>

export function render<Props, Component extends ComponentType<any>>(res: Response, component: Component, props: Props)
{
    const config = makeConfig()
    const profile: ProfileData|undefined = res.locals.profile
    const campaign: CampaignData|undefined = res.locals.campaign
    const initialState: State = {config, profile, campaign, data: {}, indices: {}}

    const ctx = {}
    const children = React.createElement(component, props)
    const content = ReactDOMServer.renderToString(
        <StaticRouter context={ctx} location={res.locals.url}>
            <Route match='/' render={({location}) =>
                <Application api={stubAPI} initialState={initialState} location={location}>
                    {campaign ?
                        <CampaignRoutes location={location} children={children}/> :
                        <MainRoutes location={location} children={children}/>
                    }
                </Application>
            }/>
        </StaticRouter>
    )
    res.render('react', {content, props, component: component.name, initialState})
}

export function renderMain(req: Request, res: Response, state: Partial<State>)
{
    const config = makeConfig()
    const profile: ProfileData|undefined = res.locals.profile
    const campaign: CampaignData|undefined = res.locals.campaign
    const initialState: State = {config, profile, campaign, data: {...state.data}, indices: {...state.indices}, ...state}

    const ctx: {action?: 'REPLACE', url?: string} = {}
    const content = ReactDOMServer.renderToString(
        <StaticRouter context={ctx} location={res.locals.url}>
            <Route match='/' render={({location}) =>
                <Application api={stubAPI} initialState={initialState} location={location}>
                    {campaign ?
                        <CampaignRoutes location={location}/> :
                        <MainRoutes location={location}/>
                    }
                </Application>
            }/>
        </StaticRouter>
    )

    if (ctx.action === 'REPLACE' && ctx.url)
    {
        res.redirect(ctx.url)
    }
    else
    {
        res.render('react-main', {content, initialState})
    }
}