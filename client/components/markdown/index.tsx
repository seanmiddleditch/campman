import * as React from 'react'
import * as MarkdownIt from 'markdown-it'
import {History} from 'history'
import wikiLinkPlugin from './plugins/wiki-link'
import secretPlugin from './plugins/secret'

require('./styles/markdown.css')

export interface MarkupProps
{
    markup: string,
    history?: History
}
export default class Markdown extends React.Component<MarkupProps, undefined>
{
    private _md: MarkdownIt.MarkdownIt

    constructor(props: MarkupProps)
    {
        super(props)

        this._md = new MarkdownIt({
            html: true,
            breaks: true,
            linkify: true,
            typographer: true
        })
        this._md.use(wikiLinkPlugin)
        this._md.use(secretPlugin)
    }

    private _interceptLink(ev: React.SyntheticEvent<EventTarget>)
    {
        if (this.props.history && ev && ev.target && (ev.target as HTMLLinkElement).href)
        {
            const url = new URL((ev.target as HTMLLinkElement).href)
            if (url.origin == window.location.origin)
            {
                this.props.history.push(url.pathname)
                ev.stopPropagation()
                ev.preventDefault()
                return false
            }
        }
        return true
    }

    render()
    {
        const html = this._md.render(this.props.markup)
        return (
            <div className='markdown' dangerouslySetInnerHTML={{__html: html}} onClick={(ev) => this._interceptLink(ev)}/>
        )
    }
}