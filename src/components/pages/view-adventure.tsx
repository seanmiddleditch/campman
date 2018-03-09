import * as React from 'react'
import { RawDraft } from '../raw-draft'
import { AdventureData } from '../../types/content'
import { RawDraftContentState } from 'draft-js'

interface Props
{
    adventure: AdventureData
    editable: boolean
}
export class ViewAdventure extends React.Component<Props>
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
                    {this.props.adventure.title}
                    {this.props.editable && <button className='btn btn-link' onClick={ev => this._handleEditClicked(ev)}><i className='fa fa-pencil'></i></button>}
                </h1>
                <h2>{this.props.adventure.created_at}</h2>
                <RawDraft document={this.props.adventure.rawbody}/>
            </div>
        )
    }
}
