import * as React from 'react'
import {ContentBlock, ContentState, Entity} from 'draft-js'

const wikiLinkDecoratorStrategy = (contentBlock: ContentBlock, callback: (s: number, e: number) => void, contentState: ContentState) => {
    contentBlock.findEntityRanges(cm => {
        const entityKey = cm.getEntity()
        return entityKey !== null && contentState.getEntity(entityKey).getType() === 'wiki-link'
    }, callback)
}

const WikiLinkComponent = (props: {contentState: ContentState, entityKey: string, offsetKey: string, children: any}) => {
    const {contentState, entityKey, offsetKey} = props
    const entity = contentState.getEntity(entityKey)
    const {target} = entity.getData()
    return <a href={'/wiki/p/' + target} target='_blank' data-offset-key={offsetKey}>{props.children}</a>
}

export const wikiLinkDecorator: any = {
    strategy: wikiLinkDecoratorStrategy,
    component: WikiLinkComponent
}
