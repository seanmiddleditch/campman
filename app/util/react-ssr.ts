import {Response} from 'express'
import * as ReactDOMServer from 'react-dom/server'
import * as React from 'react'
import {Application} from '../../common/components/application'
import * as shortid from 'shortid'

interface RenderProps
{
    title?: string
}

export function RenderReact<Props, Component extends React.ComponentClass<any>>(res: Response, component: Component, props: Props&RenderProps)
{
    const content = ReactDOMServer.renderToString(React.createElement(Application, {rpc: {config: res.locals}} as any, React.createElement(component, props)))
    res.render('react', {title: props.title, content, props, component: component.name})
}

export function RenderReactString<Props, Component extends React.ComponentClass<any>>(component: Component, env: any, props: Props&RenderProps) : string
{
    const content = ReactDOMServer.renderToString(React.createElement(Application, {rpc: {config: {...env, publicURL: env.config.publicURL}}} as any, React.createElement(component, props)))
    const id = shortid()
    const fragment = `<div id='${id}'>${content}</div><script>ReactDOM.hydrate(React.createElement(Application,{rpc:api},React.createElement(${component.name},${JSON.stringify(props)})),document.getElementById('${id}'))</script>`
    return fragment
}