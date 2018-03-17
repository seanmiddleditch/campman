import * as React from 'react'
import {Response} from 'express'
import * as ReactDOMServer from 'react-dom/server'
import {Application} from '../components/application'
import * as shortid from 'shortid'
import {URL} from 'url'
import {API, CharacterData, CampaignData, MediaFile, WikiPageData, ProfileData, AdventureData} from '../types'

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
    const profile = res.locals.profile
    const initialState = {config, profile}
    const content = ReactDOMServer.renderToString(<Application api={stubAPI} initialState={initialState}>{React.createElement(component, props)}</Application>)
    res.render('react', {content, props, component: component.name})
}