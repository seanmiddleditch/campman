import * as React from 'react'

import {CharacterEditor} from '../character-editor'
import {CharacterController, CharacterFields} from '../character-controller'
import {ImageThumb} from '../image-thumb'
import {SaveButton} from '../save-button'
import {RawDraft} from '../raw-draft'

interface Props
{
    id?: number
    char: CharacterFields,
    editable: boolean
}
interface State
{
    char: CharacterFields
    editing: boolean
}
export class ViewCharacter extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {
            char: {...this.props.char},
            editing: false
        }
    }

    private _handleEditClicked(ev: React.MouseEvent<HTMLElement>)
    {
        ev.preventDefault()
        this.setState({
            char: {...this.state.char},
            editing: true
        })
    }

    private _handleSubmitClicked()
    {
        this.setState({char: {...this.state.char}, editing: false})
    }

    private _handleChange(char: CharacterFields)
    {
        this.setState({char: {...char}})
    }

    public render()
    {
        if (this.state.editing)
            return (
                <CharacterController id={this.props.id} onSubmit={() => this._handleSubmitClicked()} form={({saving, submit}) => (
                    <CharacterEditor data={this.state.char} disabled={saving} onChange={char => this._handleChange(char)} buttons={() => (
                        <div className='ml-sm-2 float-right'>
                            <SaveButton disabled={saving} saving={saving} onClick={() => submit(this.state.char)}/>
                        </div>
                    )}/>
                )}/>
            )
        else
            return (
                <div>
                    <h1>{this.state.char.title}{this.props.editable && <button className='btn btn-link' onClick={ev => this._handleEditClicked(ev)}><i className='fa fa-pencil'></i> edit</button>}</h1>
                    <div className='pull-right'>
                        {this.state.char.portrait && !(this.state.char.portrait instanceof File) && <ImageThumb hash={this.state.char.portrait.hash} size={200}/>}
                    </div>
                    <RawDraft raw={this.state.char.body}/>
                </div>
            )
    }
}