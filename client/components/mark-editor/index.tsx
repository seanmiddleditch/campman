import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as ReactRouter from 'react-router'
import {
    Editor,
    EditorState,
    ContentState,
    ContentBlock,
    RichUtils,
    SelectionState,
    Modifier,
    CompositeDecorator,
    AtomicBlockUtils,
    genKey,
    convertToRaw,
    convertFromRaw
} from 'draft-js'

import {MediaFile} from '../../types/media-file'

import {MediaSelector} from '../media-selector'

import {StyleButton} from './components/style-button'
import {PreviewBar} from './components/preview-bar'

import {decorators} from './decorators'

import {applyMarkdownShortcutsOnInput} from './helpers/markdown-shortcuts'
import {blockRenderer, handleReturn} from './helpers/block-utils'

require('./styles/editor.css')
require('draft-js/dist/Draft.css')

interface MarkEditorProps
{
    document: any
    disabled?: boolean
    editable?: boolean
    onChange: (document: any) => void
    buttons?: () => any
    tabIndex?: number
}
interface MarkEditorState
{
    editorState: EditorState
    preview: boolean
    mediaPopupOpen: boolean
}
export class MarkEditor extends React.Component<MarkEditorProps, MarkEditorState>
{
    static contextTypes = { router: PropTypes.object.isRequired }
    
    context: ReactRouter.RouterChildContext<MarkEditorProps>

    refs: {
        editor: HTMLElement
    }

    constructor(props: MarkEditorProps)
    {
        super(props)

        const editorState = (() => {
            if (props.document)
            {
                const content = convertFromRaw(props.document)
                return EditorState.createWithContent(content, decorators)
            }
            return EditorState.createEmpty(decorators)
        })()

        this.state = {
            editorState,
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
        const contentState = this.state.editorState.getCurrentContent()
        const rawState = convertToRaw(contentState)
        this.props.onChange(rawState)
    }

    private _blockRenderer(block: ContentBlock)
    {
        return blockRenderer(block, this.state.editorState)
    }

    private _handleBeforeInput(text: string, editorState: EditorState) :  'handled'|'not-handled'
    {
        const newEditorState = applyMarkdownShortcutsOnInput(text, editorState)
        if (newEditorState && newEditorState !== editorState)
        {
            this.setState({editorState: newEditorState})
            return 'handled'
        }
        return 'not-handled'
    }

    private _handleKeyCommand(command: string, editorState: EditorState) :  'handled'|'not-handled'
    {
        const newEditorState = RichUtils.handleKeyCommand(editorState, command)
        if (newEditorState && newEditorState !== editorState)
        {
            this.setState({editorState: newEditorState})
            return 'handled'
        }
        return 'not-handled'
    }

    private _handleReturn(ev: React.KeyboardEvent<{}>, editorState: EditorState) :  'handled'|'not-handled'
    {
        const newEditorstate = handleReturn(editorState)
        if (newEditorstate && newEditorstate !== editorState)
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

    private _handleClick(ev: React.MouseEvent<HTMLElement>)
    {
        this.refs.editor.focus()
        ev.preventDefault()
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
            <div className='draft-editor' hidden={this.state.preview} onClick={ev => this._handleClick(ev)}>
                {(this.props.editable === undefined || this.props.editable) && (
                    <div>
                        <MediaSelector visible={this.state.mediaPopupOpen} onSelect={file => this._handleMedia(file)} onCancel={() => this.setState({mediaPopupOpen: false})}/>
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
                            {this.props.buttons && this.props.buttons()}
                        </div>
                    </div>
                )}
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
                        tabIndex={this.props.tabIndex}
                    />
                </div>
            </div>
        )
    }
}