import * as React from 'react'
import * as ReactDOM from 'react-dom'
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
    convertFromRaw,
    RawDraftContentState
} from 'draft-js'

import {MediaSelectDialog} from '../media-select-dialog'

import {StyleButton} from './components/style-button'
import {PreviewBar} from './components/preview-bar'

import {decorators} from './decorators'

import {applyMarkdownShortcutsOnInput} from './helpers/markdown-shortcuts'
import {blockRenderer, handleReturn, blockRenderMap} from './helpers/block-utils'

import {MediaFile} from '../../types'

interface Props
{
    document: RawDraftContentState|undefined
    disabled?: boolean
    editable?: boolean
    onChange: (document: RawDraftContentState) => void
    buttons?: () => React.ReactNode
    tabIndex?: number
}
interface State
{
    editorState: EditorState
    preview: boolean
    mediaPopupOpen: boolean
    active: boolean
}
export class MarkEditor extends React.Component<Props, State>
{
    refs: {
        editor: HTMLElement
    }

    constructor(props: Props)
    {
        super(props)

        const editorState = props.document ?
            EditorState.createWithContent(convertFromRaw(props.document), decorators) :
            EditorState.createEmpty(decorators)

        this.state = {
            editorState,
            preview: false,
            mediaPopupOpen: false,
            active: false
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
        this.setState({active: true})
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

    private _handleClick(ev: React.MouseEvent<HTMLElement>)
    {
        if (!this.props.disabled && !this.state.mediaPopupOpen)
        {
            this.refs.editor.focus()
            ev.preventDefault()
        }
    }

    private _handleOpenMediaSelector()
    {
        this.setState({mediaPopupOpen: true})
    }

    private _handleCancelMediaSelector()
    {
        this.setState({mediaPopupOpen: false})
    }
    
    private _handleInsertMedia(media: MediaFile)
    {
        this.setState({mediaPopupOpen: false})

        const {editorState} = this.state
        const contentState = editorState.getCurrentContent()
        const selection = editorState.getSelection()

        const contentStateWithEntity = contentState.createEntity('media', 'IMMUTABLE', {...media})
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
            <div>
                <MediaSelectDialog visible={this.state.mediaPopupOpen} path='/' onSelect={file => this._handleInsertMedia(file)} onCancel={() => this._handleCancelMediaSelector()}/>
                <div className='draft-editor form-control' style={{minHeight: '50vh', height: 'auto'}} hidden={this.state.preview} onClick={ev => this._handleClick(ev)}>
                    {(this.props.editable === undefined || this.props.editable) && (
                        <div className='clearfix border-bottom pb-2 pt-2 sticky-top bg-white' style={{top: '60px'}}>
                            <span className='btn-group' role='group'>
                                <StyleButton active={this._isInlineStyleActive('BOLD')} onToggle={() => this._handleInlineStyleClicked('BOLD')}><i className='fa fa-bold'></i></StyleButton>
                                <StyleButton active={this._isInlineStyleActive('ITALIC')} onToggle={() => this._handleInlineStyleClicked('ITALIC')}><i className='fa fa-italic'></i></StyleButton>
                                <StyleButton active={this._isInlineStyleActive('UNDERLINE')} onToggle={() => this._handleInlineStyleClicked('UNDERLINE')}><i className='fa fa-underline'></i></StyleButton>
                            </span>
                            <span className='btn-group ml-sm-2' role='group'>
                                <StyleButton active={this._isBlockStyleActive('unstyled')} onToggle={() => this._handleBlockStyleClicked('unstyled')}>Normal</StyleButton>
                                <StyleButton active={this._isBlockStyleActive('header-one')} onToggle={() => this._handleBlockStyleClicked('header-one')}>H1</StyleButton>
                                <StyleButton active={this._isBlockStyleActive('header-two')} onToggle={() => this._handleBlockStyleClicked('header-two')}>H2</StyleButton>
                                <StyleButton active={this._isBlockStyleActive('header-three')} onToggle={() => this._handleBlockStyleClicked('header-three')}>H3</StyleButton>
                                <StyleButton active={this._isBlockStyleActive('secret')} onToggle={() => this._handleBlockStyleClicked('secret')}><i className='fa fa-eye-slash'></i></StyleButton>
                            </span>
                            <span className='btn-group ml-sm-2' role='group'>
                                <StyleButton active={!!this.state.mediaPopupOpen} onToggle={() => this._handleOpenMediaSelector()}><i className='fa fa-picture-o'></i></StyleButton>
                            </span>
                            {this.props.buttons && this.props.buttons()}
                        </div>
                    )}
                    {this.state.active && <div className='edit-area mt-2'>
                        <Editor ref='editor'
                            editorState={this.state.editorState}
                            onBlur={() => this._flushState()}
                            handleBeforeInput={(text, s) => this._handleBeforeInput(text, s)}
                            handleKeyCommand={(c, s) => this._handleKeyCommand(c, s)}
                            handleReturn={(ev, s) => this._handleReturn(ev, s)}
                            readOnly={this.props.disabled || this.state.mediaPopupOpen}
                            onChange={editorState => this._onChange(editorState)}
                            blockRenderMap={blockRenderMap}
                            blockRendererFn={this._blockRenderer.bind(this)}
                            tabIndex={this.props.tabIndex}
                        />
                    </div>}
                </div>
            </div>
        )
    }
}
