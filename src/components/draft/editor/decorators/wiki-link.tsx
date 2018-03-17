import * as React from 'react'
import { ContentBlock, ContentState, Entity } from 'draft-js'
import { WikiLink } from '../../entities/wiki-link'

const wikiLinkDecoratorStrategy = (contentBlock: ContentBlock, callback: (s: number, e: number) => void, contentState: ContentState) => {
    contentBlock.findEntityRanges(cm => {
        const entityKey = cm.getEntity()
        return entityKey !== null && contentState.getEntity(entityKey).getType() === 'wiki-link'
    }, callback)
}

const WikiLinkWrapper = (props: {contentState: ContentState, entityKey: string, offsetKey: string, children: any}) => {
    const {contentState, entityKey, offsetKey} = props
    const entity = contentState.getEntity(entityKey)
    const {target} = entity.getData()
    return <WikiLink target={target} offsetKey={offsetKey}>{props.children}</WikiLink>
}

export const wikiLinkDecorator: any = {
    strategy: wikiLinkDecoratorStrategy,
    component: WikiLinkWrapper
}
