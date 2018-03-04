import * as React from 'react'
import { MarkEditor } from '../mark-editor'
import { SaveButton } from '../save-button'
import { RawDraft } from '../raw-draft'
import { WikiForm } from '../forms/wiki-form'
import { WikiPageInput, WikiPageData } from '../../types/content'
import { RawDraftContentState } from 'draft-js'

interface WikiPageEditorProps
{
    title: string
    tags: string
    slug?: string
    rawbody: RawDraftContentState
    visibility: 'Public'|'Hidden'
    editable?: boolean
}
interface WikiPageEditorState
{
    data: WikiPageInput
    editing: boolean
}
export class ViewWiki extends React.Component<WikiPageEditorProps, WikiPageEditorState>
{
    constructor(props: WikiPageEditorProps)
    {
        super(props)
        this.state = {
            data: {
                title: this.props.title,
                rawbody: this.props.rawbody,
                slug: this.props.slug,
                tags: this.props.tags,
                visibility: this.props.visibility
            },
            editing: false
        }
    }

    private _handleSubmitted(data: WikiPageInput)
    {
        this.setState({data, editing: false})
    }

    private _handleEditClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        ev.preventDefault()
        if (this.props.editable)
            this.setState({editing: true})
    }

    render()
    {
        if (this.state.editing)
            return (
                <WikiForm initial={this.state.data} onSubmit={data => this._handleSubmitted(data)}/>
            )
        else
            return (
                <div>
                    <h1>
                        {this.state.data.title || this.props.title}
                        {this.props.editable && <button className='btn btn-link' onClick={ev => this._handleEditClicked(ev)}><i className='fa fa-pencil'></i></button>}
                    </h1>
                    <div>
                        <i className='fa fa-tags'></i> {this.state.data.tags ? this.state.data.tags : <span className='text-muted'>no tags</span>}
                    </div>
                    <RawDraft document={this.state.data.rawbody || this.props.rawbody}/>
                </div>
            )
    }
}
