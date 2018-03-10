import * as React from 'react'
import { convertFromRaw, ContentState, ContentBlock, DraftInlineStyle, RawDraftContentState } from 'draft-js'
import { ImageThumb } from '../image-thumb'

type ElementConfig = (props: any) => any
interface ElementsConfig {
    [key: string]: ElementConfig | undefined
}

const elementMap: ElementsConfig = {
    'unstyled': props => <p>{props.children}</p>,
    'header-one': ({children}) => <h1>{children}</h1>,
    'header-two': ({children}) => <h2>{children}</h2>,
    'header-three': ({children}) => <h3>{children}</h3>,
    'secret': ({children}) => <div className='alert alert-dark'>{children}</div>
}

function htmlEscape(text: string) {
    return text.replace(/[&]/g, '&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot').replace(/'/g, '&#39;')
}

function renderEntity(entity: any, children?: any) {
    switch (entity.type)
    {
        case 'wiki-link':
            return <a href={`/wiki/p/${entity.data.target}`}>{children}</a>
        default:
            return children
    }
}

function renderAtomicBlock(block: ContentBlock, draft: ContentState) {
    const entityKey = block.getEntityAt(0)
    const entity = draft.getEntity(entityKey)
    if (!entity)
        return <div/>

    const entityType = entity.getType()

    if (entityType === 'image')
    {
        const {url} = entity.getData()
        return <img src={url}/>
    }
    else if (entityType === 'media')
    {
        const {hash, extension} = entity.getData()
        return <ImageThumb hash={hash} size={400} />
    }
    else
    {
        return <i className='fa fa-file-image-o'></i>
    }
}

function expandSections(block: ContentBlock, draft: ContentState) {
    const edges: {index: number, style: DraftInlineStyle | undefined, entity: string | undefined, action: 'begin' | 'end' }[] = []

    block.findStyleRanges(() => true, (start, end) => {
        const style = block.getInlineStyleAt(start)
        edges.push({ index: start, style, action: 'begin', entity: undefined })
        edges.push({ index: end, style, action: 'end', entity: undefined })
    })
    block.findEntityRanges(() => true, (start, end) => {
        const entity = block.getEntityAt(start)
        edges.push({ index: start, entity, action: 'begin', style: undefined })
        edges.push({ index: end, entity, action: 'end', style: undefined })
    })

    edges.sort((a, b) => a.index - b.index)

    const styles = new Set<string>()
    const chunks: {styles: Set<string>, entity: any | undefined, text: string}[] = []
    const text = block.getText()
    let entity: string | undefined = undefined
    let lastOffset = 0

    for (const edge of edges)
    {
        const {index, style, action} = edge

        if (index !== lastOffset)
        {
            chunks.push({ styles: new Set(styles), entity, text: text.slice(lastOffset, index) })
            lastOffset = index
        }

        if (action === 'begin')
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

function renderSections(sections: {styles: Set<string>, entity: any | undefined, text: string}[]) {
    return <span>{sections.map((sec, idx) => {
        if (sec.styles.size !== 0)
            return <span key={idx} className={Array.from(sec.styles.keys()).join(' ')}>{sec.text}</span>
        else if (sec.entity)
            return <span key={idx}>{renderEntity(sec.entity, sec.text)}</span>
        else
            return <span key={idx}>{sec.text}</span>
    })}</span>
}

function renderBasicBlock(block: ContentBlock, draft: ContentState) {
    const render = elementMap[block.getType()]
    if (!render) return <div/>

    const sections = expandSections(block, draft)
    const text = renderSections(sections)

    return render({children: text})
}

export const RawDraft = ({document}: {document: string|RawDraftContentState}) => {
    try
    {
        const state = typeof document === 'string' ?
            convertFromRaw(JSON.parse(document)) :
            convertFromRaw(document)
        const blockMap = state.getBlockMap().map((block, key) => {
            if (!block || !key) return <div/>
            switch (block.getType())
            {
                case 'atomic': return <div key={key}>{renderAtomicBlock(block, state)}</div>
                default: return <div key={key}>{renderBasicBlock(block, state)}</div>
            }
        })
    
        const blocks = blockMap.toIndexedSeq().toArray()
    
        return <div>{blocks}</div>
    }
    catch (err)
    {
        return <div/>
    }

}