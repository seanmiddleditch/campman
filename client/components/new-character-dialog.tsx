import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {Dialog} from './dialog'
import {CharacterEditor, CharacterData} from './character-editor'

interface Props
{
    onCancel: () => void
    onCreate: () => void
    visible?: boolean
    initial?: CharacterData
}
interface State
{
    char?: CharacterData
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
                body: null,
                visible: false
            }
        }
    }

    private _handleSubmitClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        ev.preventDefault()
        if (!this.state.saving)
        {
            const data = new FormData()
            data.append('slug', this.state.char.slug)
            data.append('title', this.state.char.title)
            data.append('visible', this.state.char.visible ? 'visible' : '')
            if (this.state.char.portrait instanceof File)
                data.append('portrait', this.state.char.portrait)
            data.append('rawbody', this.state.char.body ? JSON.stringify(this.state.char.body) : '')
            const saving = fetch('/chars', {
                method: 'POST',
                mode: 'same-origin',
                credentials: 'include',
                body: data
            }).then(async (response) => {
                if (!response.ok)
                    throw new Error(response.statusText)
                else if (response.status !== 200)
                    throw new Error(response.statusText)

                const body = await response.json()
                if (body.status !== 'success')
                    throw new Error(body.message)
                else
                    document.location.href = body.location
                this.setState({saving: undefined})
            }).catch(err => {
                console.error(err)
                alert(err)
                this.setState({saving: undefined})
            })
            this.setState({saving})
        }
    }

    private _handleChange(char: CharacterData)
    {
        this.setState({char})
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
                <div className='modal-header'>Add Character</div>
                <div className='modal-body'>
                    <CharacterEditor disabled={!this.props.visible} onChange={char => this._handleChange(char)} onCancel={() => this.props.onCancel()} data={this.state.char}/>
                </div>
                <div className='modal-footer'>
                    <button className='btn btn-secondary pull-left' onClick={ev => this._handleCancelClicked(ev)}><i className='fa fa-ban'></i> Cancel</button>
                    <button className='btn btn-primary' onClick={ev => this._handleSubmitClicked(ev)}><i className='fa fa-plus'></i> Create</button>
                </div>
            </Dialog>
        )
    }
}

export function ShowNewCharacterDialog() {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const onCancel = ()=>{ReactDOM.unmountComponentAtNode(div); document.body.removeChild(div)}
    const onCreate = ()=>{document.location.reload(true)}
    ReactDOM.render(React.createElement(NewCharacterDialog, {onCancel, onCreate, visible: true}), div)
}
