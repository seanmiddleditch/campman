import * as React from 'react'
import {Response} from 'express'
import * as ReactDOMServer from 'react-dom/server'
import {Application} from '../../common/components/application'
import * as shortid from 'shortid'
import {URL} from 'url'
import {API, CharacterData, CampaignData, MediaFile, WikiPageData} from '../../common/types'

interface RenderProps
{
    title?: string
}

const stubAPI: API = {
    showLoginDialog() { return new Promise(r => {}) },
    endSession() { return new Promise(r => {}) },
    saveCharacter() { return new Promise<CharacterData>(r => {}) },
    uploadFile() { return new Promise<MediaFile>(r => {}) },
    listFiles() { return new Promise<MediaFile[]>(r => {}) },
    deleteFile() { return new Promise(r => {}) },
    getImageURL() { return '' },
    getThumbURL() { return '' },
    createCampaign() { return new Promise(r => {}) },
    saveSettings() { return new Promise(r => {}) },
    saveWikiPage() { return new Promise<WikiPageData>(r => {}) },
}

const makeConfig = (resLocals: any, appLocals: any) => ({
    publicURL: new URL(appLocals.config.publicURL) as any,
    campaign: resLocals.campaign,
    profile: resLocals.profile
})

type ComponentFactory<Props> = React.ComponentClass<Props>|React.StatelessComponent<Props>

export function render<Props, Component extends ComponentFactory<any>>(res: Response, component: Component, props: Props&RenderProps)
{
    const content = ReactDOMServer.renderToString(<Application api={stubAPI} config={makeConfig(res.locals, res.app.locals)}>{React.createElement(component, props)}</Application>)
    res.render('react', {title: props.title, content, props, component: component.name})
}

// export function renderString<Props, Component extends ComponentFactory<any>>(component: Component, env: any, props: Props&RenderProps) : string
// {
//     const config = makeConfig(env, env)
//     const content = ReactDOMServer.renderToString(<Application api={stubAPI} config={config}>{React.createElement(component, props)}</Application>)
//     const id = shortid()
//     const fragment = `<div id='${id}'>${content}</div><script>ReactDOM.hydrate(React.createElement(Application,{api:new API('${env.config.publicURL}'),config:${JSON.stringify(config)}})},React.createElement(${component.name},${JSON.stringify(props)})),document.getElementById('${id}'))</script>`
//     return fragment
// }