import * as React from 'react'

import { ImageThumb } from '../image-thumb'
import { SaveButton } from '../save-button'
import { RenderRaw } from '../draft/render-raw'
import { CharacterData, CharacterInput } from '../../types'
import { RawDraftContentState } from 'draft-js'

interface Props
{
    char: CharacterData,
    editable: boolean
}
export class ViewCharacter extends React.Component<Props>
{
    private _handleEditClicked(ev: React.MouseEvent<HTMLElement>)
    {
        document.location.href = `${document.location.href}?edit=true`
    }

    public render()
    {
        return (
            <div>
                <h1>{this.props.char.title}{this.props.editable && <button className='btn btn-link' onClick={ev => this._handleEditClicked(ev)}><i className='fa fa-pencil'></i> edit</button>}</h1>
                <div className='pull-right'>
                    {this.props.char.portrait && <ImageThumb hash={this.props.char.portrait.contentMD5} size={200}/>}
                </div>
                <RenderRaw document={this.props.char.rawbody}/>
            </div>
        )
    }
}