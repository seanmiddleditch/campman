import * as React from 'react'
import {EditorState, Modifier, RichUtils, ContentBlock, ContentState, EntityInstance, DefaultDraftBlockRenderMap} from 'draft-js'
import * as Immutable from 'immutable'

import {AtomicImage} from '../components/atomic-image'
import { SecretBlock } from '../../blocks/secret'

export const blockRenderMap = DefaultDraftBlockRenderMap.merge(Immutable.Map({
    'unstyled': {
        element: 'div',
    },
    'secret': {
        element: 'blockquote',
        wrapper: <SecretBlock/>
    }
}))

export function handleReturn(editorState: EditorState)
{
    const contentState = editorState.getCurrentContent()
    const selection = editorState.getSelection()
    const block = contentState.getBlockForKey(selection.getFocusKey())
    const blockType = block.getType()

    if (/^header-/.test(blockType))
    {
        const contentStateSplit = Modifier.splitBlock(contentState, selection)
        const editorStateSplit = EditorState.push(editorState, contentStateSplit, 'split-block')
        const editorStatePlain = RichUtils.toggleBlockType(editorStateSplit, blockType)

        return editorStatePlain
    }

    if (block.getText().length === 0 && /-list-item$/.test(blockType))
    {
        const editorStatePlain = RichUtils.toggleBlockType(editorState, blockType)

        return editorStatePlain
    }

    return editorState
}

type DraftBlockRenderer = {component: any, editable?: boolean, props?: any}
type MatchAtomicBlockTypeCallback = (entity: EntityInstance) => DraftBlockRenderer
type MatchAtomicblockTypesMap = Map<string, MatchAtomicBlockTypeCallback>
function matchAtomicBlockTypes(block: ContentBlock, contentState: ContentState, types: MatchAtomicblockTypesMap)
{
    const entityKey = block.getEntityAt(0)
    const entity = contentState.getEntity(entityKey)
    const entityType = entity.getType()

    for (const [type, callback] of types.entries())
    {
        if (entityType === type)
            return callback(entity)
    }

    return undefined
}

const blockMap = new Map<string, MatchAtomicBlockTypeCallback>([
    ['image', entity => {
        const url = entity.getData().url
        
        return {
            component: AtomicImage,
            editable: false,
            props: {url}
        }
    }]
])

export function blockRenderer(block: ContentBlock, editorState: EditorState)
{
    const contentState = editorState.getCurrentContent()
    const blockType = block.getType() as string
    
    if (blockType === 'atomic')
        return matchAtomicBlockTypes(block, contentState, blockMap)
    else
        return undefined
}