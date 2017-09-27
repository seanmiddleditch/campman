import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as ReactRouter from 'react-router'
import Draft, {Editor, EditorState, ContentState, RichUtils} from 'draft-js'

import Markdown from '../markdown'
import StyleButton from './components/style-button'
import PreviewBar from './components/preview-bar'

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
            editorState: EditorState.createWithContent(content),
            preview: false
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

    private _handleKeyCommand(command: string, editorState: EditorState)
    {
        const newState = RichUtils.handleKeyCommand(editorState, command)
        if (newState)
        {
            this._onChange(newState)
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

    private _onInlineStyleClicked(style: 'BOLD'|'ITALIC'|'UNDERLINE')
    {
        this._onChange(RichUtils.toggleInlineStyle(this.state.editorState, style))
    }

    private _onBlockStyleClicked(style: string)
    {
        this._onChange(RichUtils.toggleBlockType(this.state.editorState, style));
    }

    private _inlineStyleActive(style: string)
    {
        return this.state.editorState.getCurrentInlineStyle().contains(style)
    }

    private _blockStyleActive(style: string)
    {
        return RichUtils.getCurrentBlockType(this.state.editorState) == style
    }

    render() {
        return (
            <div className='mark-editor' onClick={() => this.refs.editor.focus()}>
                <div>
                    <PreviewBar preview={this.state.preview} onChange={preview => this.setState({preview})}/>
                </div>
                <div className='draft-editor' hidden={this.state.preview}>
                    <div className='edit-bar'>
                        <span className='btn-group' role='group'>
                            <StyleButton active={this._inlineStyleActive('BOLD')} onToggle={() => this._onInlineStyleClicked('BOLD')}>B</StyleButton>
                            <StyleButton active={this._inlineStyleActive('ITALIC')} onToggle={() => this._onInlineStyleClicked('ITALIC')}>I</StyleButton>
                            <StyleButton active={this._inlineStyleActive('UNDERLINE')} onToggle={() => this._onInlineStyleClicked('UNDERLINE')}>U</StyleButton>
                        </span>
                        <span className='btn-group ml-sm-2' role='group'>
                            <StyleButton active={this._blockStyleActive('unstyled')} onToggle={() => this._onBlockStyleClicked('unstyled')}>Normal</StyleButton>
                            <StyleButton active={this._blockStyleActive('header-one')} onToggle={() => this._onBlockStyleClicked('header-one')}>H1</StyleButton>
                            <StyleButton active={this._blockStyleActive('header-two')} onToggle={() => this._onBlockStyleClicked('header-two')}>H2</StyleButton>
                            <StyleButton active={this._blockStyleActive('header-three')} onToggle={() => this._onBlockStyleClicked('header-three')}>H3</StyleButton>
                        </span>
                    </div>
                    <div>
                        <Editor ref='editor'
                            editorState={this.state.editorState}
                            onBlur={() => this._flushState()}
                            handleKeyCommand={(c, s) => this._handleKeyCommand(c, s)}
                            readOnly={this.props.disabled}
                            onChange={editorState => this._onChange(editorState)}
                            placeholder='Note body text goes here'
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