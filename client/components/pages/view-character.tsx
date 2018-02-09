import * as React from 'react'

import {CharacterEditor} from '../character-editor'
import {CharacterController, CharacterFields} from '../character-controller'
import {ImageThumb} from '../image-thumb'
import {SaveButton} from '../save-button'
import {draftToHtml} from '../../../app/util/draft-to-html'

interface Props
{
    id?: number
    char: CharacterFields,
    editable: boolean
}
interface State
{
    char: CharacterFields
    editChar?: CharacterFields
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
            editChar: {...this.state.char},
            editing: true
        })
    }

    private _handleSubmitClicked()
    {
        this.setState({char: {...this.state.editChar}, editing: false})
    }

    private _handleChange(char: CharacterFields)
    {
        this.setState({editChar: {...char}})
    }

    public render()
    {
        if (this.state.editing)
            return (
                <CharacterController id={this.props.id} onSubmit={() => this._handleSubmitClicked()} form={({saving, submit}) => (
                    <CharacterEditor data={this.props.char} disabled={saving} onChange={char => this._handleChange(char)} buttons={() => (
                        <div className='ml-sm-2 float-right'>
                            <SaveButton disabled={saving} saving={saving} onClick={() => submit(this.state.char)}/>
                        </div>
                    )}/>
                )}/>
            )
        else
            return (
                <div>
                    <h1>{this.props.char.title}{this.props.editable && <button className='btn btn-link' onClick={ev => this._handleEditClicked(ev)}><i className='fa fa-pencil'></i> edit</button>}</h1>
                    <div className='pull-right'>
                        {this.props.char.portrait && !(this.props.char.portrait instanceof File) && <ImageThumb hash={this.props.char.portrait.hash} size={200}/>}
                    </div>

                    <div dangerouslySetInnerHTML={{__html: draftToHtml(JSON.stringify(this.props.char.body), false)}}/>
                </div>
            )
    }
}