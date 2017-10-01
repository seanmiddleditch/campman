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

import {applyMarkdownShortcutsOnInput} from './helpers/markdown-shortcuts'
import {blockRenderer, handleReturn} from './helpers/block-utils'

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
        return blockRenderer(block, this.state.editorState)
    }

    private _handleBeforeInput(text: string, editorState: EditorState) :  'handled'|'not-handled'
    {
        const newEditorState = applyMarkdownShortcutsOnInput(text, editorState)
        if (newEditorState !== editorState)
        {
            this.setState({editorState: newEditorState})
            return 'handled'
        }
        return 'not-handled'
    }

    private _handleKeyCommand(command: string, editorState: EditorState) :  'handled'|'not-handled'
    {
        const newEditorstate = RichUtils.handleKeyCommand(editorState, command)
        if (newEditorstate !== editorState)
        {
            this.setState({editorState: newEditorstate})
            return 'handled'
        }
        return 'not-handled'
    }

    private _handleReturn(ev: React.KeyboardEvent<{}>, editorState: EditorState) :  'handled'|'not-handled'
    {
        const newEditorstate = handleReturn(editorState)
        if (newEditorstate !== editorState)
        {
            this.setState({editorState: newEditorstate})
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