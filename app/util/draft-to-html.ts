
interface DraftBlockEntityRange
{
    offset: number
    length: number
    key: any
}
interface DraftBlockInlineStyleRange
{
    offset: number
    length: number
    style: string
}
interface DraftBlock
{
    key: string
    text: string
    type: string
    entityRanges: DraftBlockEntityRange[]
    inlineStyleRanges: DraftBlockInlineStyleRange[]
}
interface DraftEntity
{
    type: string
    data: any
}
interface RawDraft
{
    blocks: DraftBlock[]
    entityMap: {[key: string]: DraftEntity|undefined}
}

interface ElementConfig
{
    element: string
    className?: string
}
interface ElementsConfig
{
    [key: string]: ElementConfig|undefined
}

const elementMap: ElementsConfig = {
    'unstyled': {element: 'p'},
    'header-one': {element: 'h1'},
    'header-two': {element: 'h2'},
    'header-three': {element: 'h3'},
    'secret': {element: 'div', className: 'alert alert-dark'}
}

function htmlEscape(text: string)
{
    return text.replace(/[&]/g, '&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot').replace(/'/g, '&#39;')
}

function renderElement(tag: string, props: any, children?: string)
{
    const propsText = Object.keys(props).filter(key => props[key] !== undefined).map(key => key + '="' + htmlEscape(props[key]) + '"').join(' ')
    return `<${tag} ${propsText}>${children||''}</${tag}>`
}

function renderEntity(entity: any, children?: string)
{
    switch (entity.type)
    {
        case 'wiki-link':
            const href = htmlEscape(entity.data.target)
            return `<a href="/w/${href}">${children}</a>`
        default:
            return children
    }
}

function renderAtomicBlock(block: DraftBlock, draft: RawDraft)
{
    const entityKey = block.entityRanges[0].key
    const entity = draft.entityMap[entityKey]
    if (!entity)
        return ''

    const entityType = entity.type

    if (entityType === 'image')
    {
        const {url} = entity.data
        return renderElement('img', {src: url})
    }
    else
    {
        return ''
    }
}   


function expandSections(block: DraftBlock, draft: RawDraft)
{
    const edges: {index: number, style: string|undefined, entity: any|undefined, action: 'begin'|'end'}[] = []

    block.inlineStyleRanges.forEach(rng => {
        edges.push({index: rng.offset, style: rng.style, action: 'begin', entity: undefined})
        edges.push({index: rng.offset + rng.length, style: rng.style, action: 'end', entity: undefined})
    })
    block.entityRanges.forEach(ent => {
        edges.push({index: ent.offset, entity: draft.entityMap[ent.key], action: 'begin', style: undefined})
        edges.push({index: ent.offset + ent.length, entity: draft.entityMap[ent.key], action: 'end', style: undefined})
    })

    edges.sort((a, b) => a.index - b.index)

    const styles = new Set<string>()
    const chunks: {styles: Set<string>, entity: any|undefined, text: string}[] = []
    let entity: any|undefined = undefined
    let lastOffset = 0

    for (const edge of edges)
    {
        const {index, style, action} = edge

        if (index !== lastOffset)
        {
            chunks.push({styles: new Set(styles), entity, text: block.text.slice(lastOffset, index)})
            lastOffset = index
        }

        if (action === 'begin')
        {
            if (style)
                styles.add(style)
            else
                entity = edge.entity
        }
        else
        {
            if (style)
                styles.delete(style)
            else if (entity === edge.entity)
                    entity = undefined
        }
    }

    if (lastOffset < block.text.length)
    {
        chunks.push({styles, entity, text: block.text.slice(lastOffset)})
    }

    return chunks
}

function renderSections(sections: {styles: Set<string>, entity: any|undefined, text: string}[])
{
    return sections.map(sec => {
        if (sec.styles.size !== 0)
            return renderElement('span', {'class': Array.from(sec.styles.keys()).join(' ')}, htmlEscape(sec.text))
        else if (sec.entity)
            return renderEntity(sec.entity, htmlEscape(sec.text))
        else
            return htmlEscape(sec.text)
    }).join('')
}

function renderBasicBlock(block: DraftBlock, draft: RawDraft)
{
    const elementConfig = elementMap[block.type]
    const element = elementConfig ? elementConfig.element : 'div'
    const className = elementConfig && elementConfig.className

    const sections = expandSections(block, draft)
    const text = renderSections(sections)

    return renderElement(element, {'class': className}, text)
}

export function draftToHtml(rawbody: string, showSecrets: boolean = false)
{
    if (rawbody && rawbody.length)
    {
        const raw = JSON.parse(rawbody) as RawDraft
        const result = raw.blocks ? raw.blocks.map(block => {
            const blockType = block.type

            if (blockType === 'secret' && !showSecrets)
                return ''
            else if (blockType == 'atomic')
                return renderAtomicBlock(block, raw)
            else
                return renderBasicBlock(block, raw)
        }).join('') : ''
        return result
    }
    else
    {
        return '<div/>'
    }
}