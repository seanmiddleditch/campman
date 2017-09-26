import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as ReactRouter from 'react-router'
import {Editor, EditorState, ContentState} from 'draft-js'

import Markdown from '../markdown'

require('./styles/editor.css')

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

    private _handleBlur()
    {
        this.props.onChange(this.state.editorState.getCurrentContent().getPlainText())
    }

    componentDidMount()
    {
        this.refs.editor.focus()
    }

    componentWillUnmount()
    {
        this.props.onChange(this.state.editorState.getCurrentContent().getPlainText())
    }

    render() {
        return (
            <div className='mark-editor' onClick={() => this.refs.editor.focus()}>
                <div>
                    <ul className='nav nav-tabs'>
                        <li className="nav-item">
                            <a className={'nav-link ' + (!this.state.preview && 'active')} href='#' onClick={ev => {this.setState({preview: false}); ev.preventDefault()}}>Edit</a>
                        </li>
                        <li className="nav-item">
                            <a className={'nav-link ' + (this.state.preview && 'active')} href='#' onClick={ev => {this.setState({preview: true}); ev.preventDefault()}}>Preview</a>
                        </li>
                    </ul>
                </div>
                <div className='input-group draft-editor' hidden={this.state.preview}>
                    <Editor ref='editor'
                        editorState={this.state.editorState}
                        readOnly={this.props.disabled}
                        onBlur={() => this._handleBlur()}
                        onChange={editorState => this._onChange(editorState)}
                        placeholder='Note body text goes here'
                    />
                </div>
                <div className='preview' hidden={!this.state.preview}>
                    <Markdown markup={this.props.document} history={this.context.router.history}/>
                </div>
            </div>
        )
    }
}