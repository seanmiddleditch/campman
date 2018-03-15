import * as React from 'react'
import { convertFromRaw, ContentState, ContentBlock, DraftInlineStyle, RawDraftContentState } from 'draft-js'
import { ImageBlock } from '../blocks/image'
import { SecretBlock } from '../blocks/secret'

interface BasicBlockMap
{
    [key: string]: React.SFC<object>|undefined
}

type EntityFunction = (props: {entity: any, children?: JSX.Element|string}) => React.ReactNode
interface EntityMap
{
    [key: string]: EntityFunction|undefined
}
interface AtomicBlockMap
{
    [key: string]: EntityFunction|undefined
}


const basicBlockMap: BasicBlockMap = {
    'unstyled': ({children}) => <p>{children}</p>,
    'header-one': ({children}) => <h1>{children}</h1>,
    'header-two': ({children}) => <h2>{children}</h2>,
    'header-three': ({children}) => <h3>{children}</h3>,
    'ordered-list-item': ({children}) => <li>{children}</li>,
    'unordered-list-item': ({children}) => <li>{children}</li>,
    'secret': ({children}) => <blockquote>{children}</blockquote>
}

const blockWrapperMap: BasicBlockMap = {
    'ordered-list-item': ({children}) => <ol>{children}</ol>,
    'unordered-list-item': ({children}) => <ul>{children}</ul>,
    'secret': ({children}) => <SecretBlock>{children}</SecretBlock>
}

const atomicBlockMap: AtomicBlockMap = {
    'image': ({entity, children}) => <img src={entity.data.url}/>,
    'media': ({entity, children}) => <ImageBlock hash={entity.data.hash} size={400}/>
}

const entityMap: EntityMap = {
    'wiki-link': ({entity, children}) => <a href={`/wiki/p/${entity.data.target}`}>{children}</a>
}
    

function renderEntity(entity: any, children?: JSX.Element|string)
{
    const render = entityMap[entity.type || '']
    return render ? render({entity, children}) : <span>{children}</span>
}

function renderAtomicBlock(block: ContentBlock, draft: ContentState) {
    const entityKey = block.getEntityAt(0)
    const entity = draft.getEntity(entityKey)
    if (!entity)
        return <div/>

    const entityType = entity.getType()
    const render = atomicBlockMap[entityType]

    return render ? render({entity}) : <i className='fa fa-file-image-o'></i>
}

function expandSections(block: ContentBlock, draft: ContentState) {
    const edges: {index: number, style: DraftInlineStyle | undefined, entity: string | undefined, begin: boolean }[] = []

    block.findStyleRanges(() => true, (start, end) => {
        const style = block.getInlineStyleAt(start)
        edges.push({ index: start, style, begin: true, entity: undefined })
        edges.push({ index: end, style, begin: false, entity: undefined })
    })
    block.findEntityRanges(() => true, (start, end) => {
        const entity = block.getEntityAt(start)
        edges.push({ index: start, entity, begin: true, style: undefined })
        edges.push({ index: end, entity, begin: false, style: undefined })
    })

    edges.sort((a, b) => a.index - b.index)

    const styles = new Set<string>()
    const chunks: {styles: Set<string>, entity: any | undefined, text: string}[] = []
    const text = block.getText()
    let entity: string | undefined = undefined
    let lastOffset = 0

    for (const edge of edges)
    {
        const {index, style, begin} = edge

        if (index !== lastOffset)
        {
            chunks.push({ styles: new Set(styles), entity, text: text.slice(lastOffset, index) })
            lastOffset = index
        }

        if (begin)
        {
            if (style)
                style.forEach(s => s && styles.add(s))
            else
                entity = edge.entity
        }
        else
        {
            if (style)
                style.forEach(s => s && styles.delete(s))
            else if (entity === edge.entity)
                entity = undefined
        }
    }

    if (lastOffset < text.length)
    {
        chunks.push({ styles, entity, text: text.slice(lastOffset) })
    }

    return chunks
}

function renderSections(sections: {styles: Set<string>, entity: any | undefined, text: string}[], draft: ContentState) {
    return <span>{sections.map((sec, idx) => {
        if (sec.styles.size !== 0)
            return <span key={idx} className={Array.from(sec.styles.keys()).join(' ')}>{sec.text}</span>
        else if (sec.entity)
            return <span key={idx}>{renderEntity(draft.getEntity(sec.entity), sec.text)}</span>
        else
            return <span key={idx}>{sec.text}</span>
    })}</span>
}

function renderBasicBlock(block: ContentBlock, draft: ContentState) {
    const render = basicBlockMap[block.getType()]

    const sections = expandSections(block, draft)
    const children = renderSections(sections, draft)

    return render ? render({children}) : <div>{children}</div>
}

export const RenderRaw = ({document}: {document: string|RawDraftContentState}) => {
    const state = typeof document === 'string' ?
        convertFromRaw(JSON.parse(document)) :
        convertFromRaw(document)

    let wrapper: React.SFC<object>|undefined = undefined
    let wrapped: React.ReactNode[] = []
    const blocks: React.ReactNode[] = []

    for (const [key, block] of state.getBlockMap().entrySeq().toArray())
    {
        if (!block || !key) continue

        const blockType = block.getType()
        if (blockType == 'atomic')
        {
            blocks.push(<div key={key}>{renderAtomicBlock(block, state)}</div>)
            continue
        }

        const newWrapper = blockWrapperMap[blockType]
        if (wrapper && wrapper !== newWrapper)
        {
            blocks.push(<div key={`wrap-${key}`}>{wrapper({children: wrapped})}</div>)
            wrapped = []
        }
        wrapper = newWrapper

        if (wrapper)
            wrapped.push(<div key={key}>{renderBasicBlock(block, state)}</div>)
        else
            blocks.push(<div key={key}>{renderBasicBlock(block, state)}</div>)
    }

    if (wrapper)
        blocks.push(<div key='wrap-end'>{wrapper({children: wrapped})}</div>)

    return <div>{blocks}</div>
}