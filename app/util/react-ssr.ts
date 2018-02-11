import {Response} from 'express'
import * as ReactDOMServer from 'react-dom/server'
import * as React from 'react'
import {Application} from '../../common/components/application'

interface RenderProps
{
    title?: string
}

export function RenderReact<Props, Component extends React.ComponentClass<any>>(res: Response, component: Component, props: Props&RenderProps)
{
    const content = ReactDOMServer.renderToString(React.createElement(Application, null, React.createElement(component, props)))
    res.render('react', {title: props.title, content, props, component: component.name})
}