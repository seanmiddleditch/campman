import {Response} from 'express'
import * as ReactDOMServer from 'react-dom/server'
import * as React from 'react'
import {Application} from '../../common/components/application'
import * as shortid from 'shortid'
import {URL} from 'url'

interface RenderProps
{
    title?: string
}

const makeRPC = (resLocals: any, appLocals: any) => ({
    rpc: {
        config: {
            publicURL: new URL(appLocals.config.publicURL) as any,
            campaign: resLocals.campaign,
            profile: resLocals.profile
        },
        content: undefined as any,
        characters: undefined as any,
        media: undefined as any,
        session: undefined as any
    }
})

type ComponentFactory<Props> = React.ComponentClass<Props>|React.StatelessComponent<Props>

export function RenderReact<Props, Component extends ComponentFactory<any>>(res: Response, component: Component, props: Props&RenderProps)
{
    const content = ReactDOMServer.renderToString(React.createElement(Application, makeRPC(res.locals, res.app.locals), React.createElement(component, props)))
    res.render('react', {title: props.title, content, props, component: component.name})
}

export function RenderReactString<Props, Component extends ComponentFactory<any>>(component: Component, env: any, props: Props&RenderProps) : string
{
    const content = ReactDOMServer.renderToString(React.createElement(Application, makeRPC(env, env), React.createElement(component, props)))
    const id = shortid()
    const fragment = `<div id='${id}'>${content}</div><script>ReactDOM.hydrate(React.createElement(Application,{rpc:api},React.createElement(${component.name},${JSON.stringify(props)})),document.getElementById('${id}'))</script>`
    return fragment
}