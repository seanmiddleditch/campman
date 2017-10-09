
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
    'secret': {element: 'div', className: 'secret'}
}

function htmlEscape(text: string)
{
    return text.replace('&', '&nbsp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot')
}

function renderElement(tag: string, props: any, children?: string)
{
    const propsText = Object.keys(props).filter(key => props[key] !== undefined).map(key => key + '="' + htmlEscape(props[key]) + '"').join(' ')
    return `<${tag} ${propsText}>${children||''}</${tag}>`
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
    const edges: {index: number, style: string, action: 'begin'|'end'}[] = []

    block.inlineStyleRanges.forEach(rng => {
        edges.push({
            index: rng.offset,
            style: rng.style,
            action: 'begin'
        })
        edges.push({
            index: rng.offset + rng.length,
            style: rng.style,
            action: 'end'
        })
    })

    edges.sort((a, b) => a.index - b.index)

    const styles = new Set<string>()
    const chunks: {styles: Set<string>, text: string}[] = []
    let lastOffset = 0

    for (const edge of edges)
    {
        const {index, style, action} = edge

        if (index !== lastOffset)
        {
            chunks.push({styles: new Set(styles), text: block.text.slice(lastOffset, index)})
            lastOffset = index
        }

        if (action === 'begin')
            styles.add(style)
        else
            styles.delete(style)
    }

    if (lastOffset < block.text.length)
    {
        chunks.push({styles, text: block.text.slice(lastOffset)})
    }

    return chunks
}

function renderSections(sections: {styles: Set<string>, text: string}[])
{
    return sections.map(sec => sec.styles.size !== 0 ? renderElement('span', {'class': Array.from(sec.styles.keys()).join(' ')}, htmlEscape(sec.text)) : htmlEscape(sec.text)).join('')
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

export function draftToHtml(rawbody: RawDraft, showSecrets: boolean = false)
{
    console.log(JSON.stringify(rawbody))
    const result = rawbody.blocks.map(block => {
        const blockType = block.type

        if (blockType === 'secret' && !showSecrets)
            return ''
        else if (blockType == 'atomic')
            return renderAtomicBlock(block, rawbody)
        else
            return renderBasicBlock(block, rawbody)
    }).join('')
    return result
}