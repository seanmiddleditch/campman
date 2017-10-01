import Draft, {Editor, EditorState, ContentState, ContentBlock, RichUtils, SelectionState, Modifier, CompositeDecorator, AtomicBlockUtils, genKey} from 'draft-js'

const LINK_REGEX = /\[\[(.*)\]\]$/
const STRONG_REGEX = /\*\*([^*]+)\*\*$/
//const EM_REGEX = /[^*]\*([^*]+)\*$/ -- somewhat problematic with the simpler matcher; FIXME
const UNDERLINE_REGEX = /_([^_]*)_$/
const HEADER1_REGEX = /^#\s*([^\s#].*)$/
const HEADER2_REGEX = /^##\s*([^\s#].*)$/
const HEADER3_REGEX = /^###\s*([^\s#].*)$/
const UNORDERED_LIST_REGEX = /\s*-\s+(\S)$/
const ORDERED_LIST_REGEX = /\s*\d+[.]\s+(\S)$/

type MatchLineInputCallback = (match: RegExpMatchArray, selection: SelectionState, block: ContentBlock) => EditorState|undefined
function matchLineInput(text: string, editorState: EditorState, regex: RegExp, callback: MatchLineInputCallback)
{
    const contentState = editorState.getCurrentContent()
    const selection = editorState.getSelection()
    const activeBlock = contentState.getBlockForKey(selection.getFocusKey())
    const prefixText = activeBlock.getText().substr(0, selection.getFocusOffset())

    const line = prefixText + text

    const match = line.match(LINK_REGEX)
    if (match)
    {
        const lineSelection = new SelectionState({
            anchorKey: activeBlock.getKey(),
            focusKey: activeBlock.getKey(),
            anchorOffset: line.length - match[0].length,
            focusOffset: prefixText.length
        })

        return callback(match, lineSelection, activeBlock)
    }
}

function linkifyBeforeInput(text: string, editorState: EditorState)
{
    return matchLineInput(text, editorState, LINK_REGEX, (match, selection, block) => {
        const contentState = editorState.getCurrentContent()
        const contentStateWithEntity = contentState.createEntity('wiki-link', 'MUTABLE', {target: match[1]})
        const entityKey = contentState.getLastCreatedEntityKey()

        const contentStateReplaced = Modifier.replaceText(contentStateWithEntity, selection, match[1], null, entityKey)
        const editorStateReplaced = EditorState.push(editorState, contentStateReplaced, 'apply-entity')

        const newSelection = contentStateReplaced.getSelectionAfter()
        const editorStateSelection = EditorState.forceSelection(editorStateReplaced, newSelection)
        return editorStateSelection
    })
}

function blockStyleBeforeInput(text: string, editorState: EditorState, regex: RegExp, type: string)
{
    return matchLineInput(text, editorState, regex, (match, selection, block) => {
        const contentState = editorState.getCurrentContent()
        if (block.getType() == 'unstyled')
        {
            const contentStateReplaced = Modifier.replaceText(contentState, selection, match[1])
            const newSelection = contentStateReplaced.getSelectionAfter()

            const editorStateReplaced = EditorState.push(editorState, contentStateReplaced, 'insert-characters')
            const editorStateSelection = EditorState.forceSelection(editorStateReplaced, newSelection)

            const cleanState = RichUtils.toggleBlockType(editorStateSelection, type)
            return cleanState
        }
    })
}

function inlineStyleBeforeInput(text: string, editorState: EditorState, regex: RegExp, style: string)
{
    return matchLineInput(text, editorState, regex, (match, selection, block) => {
        const contentState = editorState.getCurrentContent()
        const oldLine = block.getText()

        const oldStyle = block.getInlineStyleAt(oldLine.length)
        const newStyle = oldStyle.add(style)

        const contentStateReplaced = Modifier.replaceText(contentState, selection, match[1], newStyle)
        const newSelection = contentStateReplaced.getSelectionAfter()

        const editorStateReplaced = EditorState.push(editorState, contentStateReplaced, 'insert-characters')
        const editorStateSelection = EditorState.forceSelection(editorStateReplaced, newSelection)

        const cleanState = RichUtils.toggleInlineStyle(editorStateSelection, style)
        return cleanState
    })
}

export function applyMarkdownShortcutsOnInput(text: string, editorState: EditorState)
{
    return linkifyBeforeInput(text, editorState) ||
        inlineStyleBeforeInput(text, editorState, STRONG_REGEX, 'BOLD') ||
        // inlineStyleBeforeInput(text, editorState, EM_REGEX, 'ITALIC')
        inlineStyleBeforeInput(text, editorState, UNDERLINE_REGEX, 'UNDERLINE') ||
        blockStyleBeforeInput(text, editorState, HEADER3_REGEX, 'header-three') ||
        blockStyleBeforeInput(text, editorState, HEADER2_REGEX, 'header-two') ||
        blockStyleBeforeInput(text, editorState, HEADER1_REGEX, 'header-one') ||
        blockStyleBeforeInput(text, editorState, UNORDERED_LIST_REGEX, 'unordered-list-item') ||
        blockStyleBeforeInput(text, editorState, ORDERED_LIST_REGEX, 'ordered-list-item')
}