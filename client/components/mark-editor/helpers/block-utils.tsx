import * as React from 'react'
import {EditorState, Modifier, RichUtils, ContentBlock, ContentState, EntityInstance} from 'draft-js'
import {AtomicImage} from '../components/atomic-image'

export function handleReturn(editorState: EditorState)
{
    const contentState = editorState.getCurrentContent()
    const selection = editorState.getSelection()
    const block = contentState.getBlockForKey(selection.getFocusKey())

    if (/^header-/.test(block.getType()))
    {
        const contentStateSplit = Modifier.splitBlock(contentState, selection)
        const editorStateSplit = EditorState.push(editorState, contentStateSplit, 'split-block')
        const editorStatePlain = RichUtils.toggleBlockType(editorStateSplit, block.getType())

        return editorStatePlain
    }

    if (block.getText().length === 0 && /-list-item$/.test(block.getType()))
    {
        const editorStatePlain = RichUtils.toggleBlockType(editorState, block.getType())

        return editorStatePlain
    }
}

type DraftBlockRenderer = {component: any, editable?: boolean, props?: any}
type MatchAtomicBlockTypeCallback = (entity: EntityInstance) => DraftBlockRenderer
type MatchAtomicblockTypesMap = Map<string, MatchAtomicBlockTypeCallback>
function matchAtomicBlockTypes(block: ContentBlock, contentState: ContentState, types: MatchAtomicblockTypesMap)
{
    if (block.getType() === 'atomic')
    {
        const entityKey = block.getEntityAt(0)
        const entity = contentState.getEntity(entityKey)
        const entityType = entity.getType()

        for (const [type, callback] of types.entries())
        {
            if (entityType === type)
                return callback(entity)
        }
    }
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
    return matchAtomicBlockTypes(block, contentState, blockMap)
}