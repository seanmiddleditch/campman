import * as React from 'react'
import {MarkEditor} from '../mark-editor'
import {SaveButton} from '../save-button'
import {RawDraft} from '../raw-draft'
import {WikiForm} from '../forms/wiki-form'
import {WikiData} from '../../types/content'

interface WikiPageEditorProps
{
    title: string
    tags: string
    slug?: string
    body: object
    visibility: 'Public'|'Hidden'
    editable?: boolean
}
interface WikiPageEditorState
{
    data: WikiData
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
                rawbody: this.props.body,
                slug: this.props.slug,
                tags: this.props.tags,
                visibility: this.props.visibility
            },
            editing: false
        }
    }

    private _handleSubmitted(data: WikiData)
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
                        {this.state.data.title}
                        {this.props.editable && <button className='btn btn-link' onClick={ev => this._handleEditClicked(ev)}><i className='fa fa-pencil'></i></button>}
                    </h1>
                    <div>
                        <i className='fa fa-tags'></i> {this.state.data.tags ? this.state.data.tags : <span className='text-muted'>no tags</span>}
                    </div>
                    <RawDraft document={this.state.data.rawbody}/>
                </div>
            )
    }
}
