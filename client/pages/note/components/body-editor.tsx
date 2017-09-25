import * as React from 'react'
import {Editor, EditorState, ContentState} from 'draft-js'

interface BodyEditorProps
{
    document: string
    disabled?: boolean
    onChange: (document: string) => void
}
interface BodyEditorState
{
    editorState: EditorState
}
export default class BodyEditor extends React.Component<BodyEditorProps, BodyEditorState>
{
    refs: {
        editor: HTMLElement
    }

    constructor(props: BodyEditorProps)
    {
        super(props);

        const content = ContentState.createFromText(props.document);

        this.state = {
            editorState: EditorState.createWithContent(content)
        };
    }

    private _onChange(editorState: EditorState)
    {
        this.setState({editorState});
        this.props.onChange(editorState.getCurrentContent().getPlainText());
    }

    componentDidMount()
    {
        this.refs.editor.focus();
    }

    render() {
        return (
            <div className='note-body-editor' onClick={() => this.refs.editor.focus()}>
                <Editor ref='editor' editorState={this.state.editorState} readOnly={this.props.disabled} onChange={editorState => this._onChange(editorState)} placeholder='Note body text goes here'/>
            </div>
        );
    }
}