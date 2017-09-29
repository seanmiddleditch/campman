import * as React from 'react'
import {ContentBlock, ContentState, Entity, CompositeDecorator} from 'draft-js'
import findWithRegex from './helpers'

const STRONG_REGEX = /[*][*]([^*]+)[*][*]/g
const EM_REGEX = /[*]([^*]+)[*]($|[^*])/g
const UNDERLINE_REGEX = /_([^_]+)_/g

const inlineMarkdownStrategy = (regex: RegExp) => (contentBlock: ContentBlock, callback, contentState: ContentState) => {
    findWithRegex(regex, contentBlock, callback)
}

const InlineMarkdownComponent = (props: {contentState: ContentState, style: any, offsetKey: string, children: any}) => {
    const {contentState, offsetKey, style} = props

    return (
        <span>
            <span style={{color: '#ddd'}}>**</span>
            <strong data-offset-key={offsetKey} style={style}>{props.children}</strong>
            <span style={{color: '#ddd'}}>**</span>
        </span>
    )
}

const s = inlineMarkdownStrategy(STRONG_REGEX)

const inlineMarkdownDecorator = new CompositeDecorator([
    {
        strategy: inlineMarkdownStrategy(STRONG_REGEX),
        component: InlineMarkdownComponent,
        props: {style: {fontWeight: 'bold'}}
    },
])
export default inlineMarkdownDecorator