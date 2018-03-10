import * as React from 'react'
import { RawDraft } from '../raw-draft'
import { WikiPageInput, WikiPageData } from '../../types/content'
import { RawDraftContentState } from 'draft-js'

interface Props
{
    title: string
    tags: string
    slug?: string
    rawbody: RawDraftContentState
    visibility: 'Public'|'Hidden'
    editable?: boolean
}
export class ViewWiki extends React.Component<Props>
{
    private _handleEditClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        document.location.href = `${document.location.href}?edit=1`
    }

    render()
    {
        return (
            <div>
                <h1>
                    {this.props.title}
                    {this.props.editable && <button className='btn btn-link' onClick={ev => this._handleEditClicked(ev)}><i className='fa fa-pencil'></i></button>}
                </h1>
                <div>
                    <i className='fa fa-tags'></i> {this.props.tags ? this.props.tags : <span className='text-muted'>no tags</span>}
                </div>
                <RawDraft document={this.props.rawbody}/>
            </div>
        )
    }
}
