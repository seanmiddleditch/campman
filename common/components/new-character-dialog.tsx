import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {Dialog} from './dialog'
import {CharacterEditor} from './character-editor'
import {CharacterController} from './character-controller'
import {SaveButton} from './save-button'

import {CharacterData} from '../types'

interface Props
{
    onCancel: () => void
    onCreate: () => void
    visible?: boolean
    initial?: CharacterData
}
interface State
{
    char: CharacterData
    saving?: Promise<void>
}
export class NewCharacterDialog extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {
            char: props.initial || {
                title: '',
                visible: false
            }
        }
    }

    private _handleSubmit()
    {
        document.location.reload(true)
    }

    private _handleChange(char: CharacterData)
    {
        this.setState({char})
    }

    private _handleSubmitClicked(ev: React.MouseEvent<HTMLButtonElement>, submit: (data: CharacterData) => void)
    {
        ev.preventDefault()
        if (this.state.char)
            submit(this.state.char)
    }

    private _handleCancelClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        ev.preventDefault()
        this.props.onCancel()
    }

    render()
    {
        return (
            <Dialog visible={this.props.visible}>
                <CharacterController onSubmit={() => this._handleSubmit()} form={({saving, submit, errors}) => <div>
                    <div className='modal-header'>Add Character</div>
                    <div className='modal-body'>
                        <CharacterEditor disabled={!this.props.visible || saving} onChange={char => this._handleChange(char)} data={this.state.char}/>
                    </div>
                    <div className='modal-footer'>
                        <button className='btn btn-secondary pull-left' onClick={ev => this._handleCancelClicked(ev)}><i className='fa fa-ban'></i> Cancel</button>
                        <SaveButton icon='plus' title='Create' working='Creating' disabled={saving} saving={saving} onClick={() => submit(this.state.char)}/>
                    </div>
                </div>}/>
            </Dialog>
        )
    }
}