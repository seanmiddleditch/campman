import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as ReactRouter from 'react-router'
import Draft, {Editor, EditorState, ContentState, ContentBlock, RichUtils, SelectionState, Modifier, CompositeDecorator, AtomicBlockUtils, genKey} from 'draft-js'

import MediaFile from '../../types/media-file'

import Markdown from '../markdown'
import MediaSelector from '../media-selector'

import StyleButton from './components/style-button'
import PreviewBar from './components/preview-bar'

import findWithRegex from './decorators/helpers'
import decorators from './decorators'

const LINK_REGEX = /\[\[(.*)\]\]$/
const STRONG_REGEX = /\*\*([^*]+)\*\*$/
//const EM_REGEX = /[^*]\*([^*]+)\*$/ -- somewhat problematic with the simpler matcher; FIXME
const UNDERLINE_REGEX = /_([^_]*)_$/
const HEADER1_REGEX = /^#\s*([^\s#].*)$/
const HEADER2_REGEX = /^##\s*([^\s#].*)$/
const HEADER3_REGEX = /^###\s*([^\s#].*)$/
const UNORDERED_LIST_REGEX = /\s*-\s+(\S)$/
const ORDERED_LIST_REGEX = /\s*\d+[.]\s+(\S)$/

function linkifyBeforeInput(text: string, editorState: EditorState)
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

        const contentStateWithEntity = contentState.createEntity('wiki-link', 'MUTABLE', {target: match[1]})
        const entityKey = contentState.getLastCreatedEntityKey()

        const contentStateReplaced = Modifier.replaceText(contentStateWithEntity, lineSelection, match[1], null, entityKey)
        const editorStateReplaced = EditorState.push(editorState, contentStateReplaced, 'apply-entity')

        const newSelection = contentStateReplaced.getSelectionAfter()
        const editorStateSelection = EditorState.forceSelection(editorStateReplaced, newSelection)
        return editorStateSelection
    }

    return editorState
}

function blockStyleBeforeInput(text: string, editorState: EditorState, regex: RegExp, type: string)
{
    const contentState = editorState.getCurrentContent()
    const selection = editorState.getSelection()
    const activeBlock = contentState.getBlockForKey(selection.getFocusKey())
    const prefixText = activeBlock.getText().substr(0, selection.getFocusOffset())

    const line = prefixText + text

    const match = line.match(regex)
    if (match && activeBlock.getType() == 'unstyled')
    {

        const lineSelection = new SelectionState({
            anchorKey: activeBlock.getKey(),
            focusKey: activeBlock.getKey(),
            anchorOffset: line.length - match[0].length,
            focusOffset: prefixText.length
        })

        const contentStateReplaced = Modifier.replaceText(contentState, lineSelection, match[1])
        const newSelection = contentStateReplaced.getSelectionAfter()

        const editorStateReplaced = EditorState.push(editorState, contentStateReplaced, 'insert-characters')
        const editorStateSelection = EditorState.forceSelection(editorStateReplaced, newSelection)

        const cleanState = RichUtils.toggleBlockType(editorStateSelection, type)
        return cleanState
    }

    return editorState
}

function inlineStyleBeforeInput(text: string, editorState: EditorState, regex: RegExp, style: string)
{
    const contentState = editorState.getCurrentContent()
    const selection = editorState.getSelection()
    const activeBlock = contentState.getBlockForKey(selection.getFocusKey())
    const prefixText = activeBlock.getText().substr(0, selection.getFocusOffset())

    const line = prefixText + text

    const match = line.match(regex)
    if (match)
    {
        const lineSelection = new SelectionState({
            anchorKey: activeBlock.getKey(),
            focusKey: activeBlock.getKey(),
            anchorOffset: line.length - match[0].length,
            focusOffset: prefixText.length
        })

        const oldStyle = activeBlock.getInlineStyleAt(prefixText.length)
        const newStyle = oldStyle.add(style)

        const contentStateReplaced = Modifier.replaceText(contentState, lineSelection, match[1], newStyle)
        const newSelection = contentStateReplaced.getSelectionAfter()

        const editorStateReplaced = EditorState.push(editorState, contentStateReplaced, 'insert-characters')
        const editorStateSelection = EditorState.forceSelection(editorStateReplaced, newSelection)

        const cleanState = RichUtils.toggleInlineStyle(editorStateSelection, style)
        return cleanState
    }

    return editorState
}

require('./styles/editor.css')
require('draft-js/dist/Draft.css')

interface MarkEditorProps
{
    document: string
    disabled?: boolean
    onChange: (document: string) => void
}
interface MarkEditorState
{
    editorState: EditorState
    preview: boolean
    mediaPopupOpen: boolean
}
export default class MarkEditor extends React.Component<MarkEditorProps, MarkEditorState>
{
    static contextTypes = { router: PropTypes.object.isRequired }
    
    context: ReactRouter.RouterChildContext<MarkEditorProps>

    refs: {
        editor: HTMLElement
    }

    constructor(props: MarkEditorProps)
    {
        super(props)

        const content = ContentState.createFromText(props.document)

        this.state = {
            editorState: EditorState.createWithContent(content, decorators),
            preview: false,
            mediaPopupOpen: false
        }
    }

    private _onChange(editorState: EditorState)
    {
        this.setState({editorState})
    }

    private _flushState()
    {
        this.props.onChange(this.state.editorState.getCurrentContent().getPlainText())
    }

    private _blockRenderer(block: ContentBlock)
    {
        const Img = (props: {blockProps: {url: string}}) => (<img className='img-fluid rounded' src={props.blockProps.url} alt='image'/>)

        if (block.getType() !== 'atomic')
            return null

        const contentState = this.state.editorState.getCurrentContent()
        const entityKey = block.getEntityAt(0)
        if (!entityKey)
            return null

        const type = contentState.getEntity(entityKey).getType()
        if (type !== 'image')
            return null

        const entity = contentState.getEntity(entityKey)
        const url = entity.getData().url
        
        return {
            component: Img,
            editable: false,
            props: {url}
        }
    }

    private _handleBeforeInput(text: string, editorState: EditorState) :  'handled'|'not-handled'
    {
        let newEditorState = editorState

        newEditorState = linkifyBeforeInput(text, newEditorState)
        newEditorState = inlineStyleBeforeInput(text, newEditorState, STRONG_REGEX, 'BOLD')
        //newEditorState = inlineStyleBeforeInput(text, newEditorState, EM_REGEX, 'ITALIC')
        newEditorState = inlineStyleBeforeInput(text, newEditorState, UNDERLINE_REGEX, 'UNDERLINE')
        newEditorState = blockStyleBeforeInput(text, newEditorState, HEADER1_REGEX, 'header-one')
        newEditorState = blockStyleBeforeInput(text, newEditorState, HEADER2_REGEX, 'header-two')
        newEditorState = blockStyleBeforeInput(text, newEditorState, HEADER3_REGEX, 'header-three')
        newEditorState = blockStyleBeforeInput(text, newEditorState, UNORDERED_LIST_REGEX, 'unordered-list-item')
        newEditorState = blockStyleBeforeInput(text, newEditorState, ORDERED_LIST_REGEX, 'ordered-list-item')

        if (newEditorState !== editorState)
        {
            this.setState({editorState: newEditorState})
            return 'handled'
        }
        else
        {
            return 'not-handled'
        }
    }

    private _handleKeyCommand(command: string, editorState: EditorState) :  'handled'|'not-handled'
    {
        const newState = RichUtils.handleKeyCommand(editorState, command)
        if (newState)
        {
            this._onChange(newState)
            return 'handled'
        }
        return 'not-handled'
    }

    private _handleReturn(ev: React.KeyboardEvent<{}>, editorState: EditorState) :  'handled'|'not-handled'
    {
        const contentState = editorState.getCurrentContent()
        const selection = editorState.getSelection()
        const block = contentState.getBlockForKey(selection.getFocusKey())

        if (/^header-/.test(block.getType()))
        {
            const contentStateSplit = Modifier.splitBlock(contentState, selection)
            const editorStateSplit = EditorState.push(editorState, contentStateSplit, 'split-block')
            const editorStatePlain = RichUtils.toggleBlockType(editorStateSplit, block.getType())

            this.setState({editorState: editorStatePlain})
            return 'handled'
        }

        if (block.getText().length === 0 && /-list-item$/.test(block.getType()))
        {
            const editorStatePlain = RichUtils.toggleBlockType(editorState, block.getType())

            this.setState({editorState: editorStatePlain})
            return 'handled'
        }

        return 'not-handled'
    }

    componentDidMount()
    {
        this.refs.editor.focus()
    }

    componentWillUnmount()
    {
        this._flushState()
    }

    private _handleInlineStyleClicked(style: 'BOLD'|'ITALIC'|'UNDERLINE')
    {
        this._onChange(RichUtils.toggleInlineStyle(this.state.editorState, style))
    }

    private _handleBlockStyleClicked(style: string)
    {
        this._onChange(RichUtils.toggleBlockType(this.state.editorState, style));
    }

    private _handleMedia(file: MediaFile)
    {
        this.setState({mediaPopupOpen: false})

        const {editorState} = this.state
        const contentState = editorState.getCurrentContent()
        const selection = editorState.getSelection()

        const contentStateWithEntity = contentState.createEntity('image', 'IMMUTABLE', {url: file.url})
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
        const editorStateWithBlock = AtomicBlockUtils.insertAtomicBlock(
            editorState,
            entityKey,
            ' '
        )
        const editorStateWithSelection = EditorState.forceSelection(
            editorStateWithBlock,
            editorState.getCurrentContent().getSelectionAfter()
        )
        this.setState({editorState: editorStateWithSelection})
    }

    private _isInlineStyleActive(style: string)
    {
        return this.state.editorState.getCurrentInlineStyle().contains(style)
    }

    private _isBlockStyleActive(style: string)
    {
        return RichUtils.getCurrentBlockType(this.state.editorState) == style
    }

    render() {
        return (
            <div className='mark-editor' onClick={() => this.refs.editor.focus()}>
                <MediaSelector visible={this.state.mediaPopupOpen} onSelect={file => this._handleMedia(file)} onCancel={() => this.setState({mediaPopupOpen: false})}/>
                <div>
                    <PreviewBar preview={this.state.preview} onChange={preview => this.setState({preview})}/>
                </div>
                <div className='draft-editor' hidden={this.state.preview}>
                    <div className='edit-bar'>
                        <span className='btn-group' role='group'>
                            <StyleButton active={this._isInlineStyleActive('BOLD')} onToggle={() => this._handleInlineStyleClicked('BOLD')}>B</StyleButton>
                            <StyleButton active={this._isInlineStyleActive('ITALIC')} onToggle={() => this._handleInlineStyleClicked('ITALIC')}>I</StyleButton>
                            <StyleButton active={this._isInlineStyleActive('UNDERLINE')} onToggle={() => this._handleInlineStyleClicked('UNDERLINE')}>U</StyleButton>
                        </span>
                        <span className='btn-group ml-sm-2' role='group'>
                            <StyleButton active={this._isBlockStyleActive('unstyled')} onToggle={() => this._handleBlockStyleClicked('unstyled')}>Normal</StyleButton>
                            <StyleButton active={this._isBlockStyleActive('header-one')} onToggle={() => this._handleBlockStyleClicked('header-one')}>H1</StyleButton>
                            <StyleButton active={this._isBlockStyleActive('header-two')} onToggle={() => this._handleBlockStyleClicked('header-two')}>H2</StyleButton>
                            <StyleButton active={this._isBlockStyleActive('header-three')} onToggle={() => this._handleBlockStyleClicked('header-three')}>H3</StyleButton>
                        </span>
                        <span className='btn-group ml-sm-2' role='group'>
                            <button className='btn btn-secondary' onClick={() => this.setState({mediaPopupOpen: true})}><i className='fa fa-picture-o'></i></button>
                        </span>
                    </div>
                    <div className='edit-area'>
                        <Editor ref='editor'
                            editorState={this.state.editorState}
                            onBlur={() => this._flushState()}
                            handleBeforeInput={(text, s) => this._handleBeforeInput(text, s)}
                            handleKeyCommand={(c, s) => this._handleKeyCommand(c, s)}
                            handleReturn={(ev, s) => this._handleReturn(ev, s)}
                            readOnly={this.props.disabled || this.state.mediaPopupOpen}
                            onChange={editorState => this._onChange(editorState)}
                            placeholder='Note body text goes here'
                            blockRendererFn={this._blockRenderer.bind(this)}
                        />
                    </div>
                </div>
                <div className='preview' hidden={!this.state.preview}>
                    <Markdown markup={this.props.document} history={this.context.router.history}/>
                </div>
            </div>
        )
    }
}