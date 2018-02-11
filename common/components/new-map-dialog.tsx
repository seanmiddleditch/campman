import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {Dialog} from './dialog'
import {ImageSelect} from './image-select'
import {SaveButton} from './save-button'

interface Props
{
    onCancel: () => void
    onCreate: () => void
    visible?: boolean
}
interface State
{
    file?: File
    title: string
    slug: string
    saving?: Promise<void>
}
export class NewMapDialog extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {
            title: 'New Map',
            slug: ''
        }
    }

    private static _makeSlug(str: string)
    {
        return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/ +/g, ' ').trim().replace(/ /g, '-')
    }

    private _handleTitleChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        ev.preventDefault()
        this.setState({title: ev.target.value})
    }

    private _handleSlugChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        ev.preventDefault()
        this.setState({slug: ev.target.value})
    }

    private _handleSubmitClicked()
    {
        if (!this.state.saving)
        {
            const data = new FormData()
            data.append('slug', this.state.slug)
            data.append('title', this.state.title)
            //data.append('visibility', this.state.visibility)
            if (this.state.file) data.append('file', this.state.file)
            const saving = fetch('/maps', {
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

    private _handleCancelClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        ev.preventDefault()
        this.props.onCancel()
    }

    private _handleVisibilityClicked(ev: React.MouseEvent<HTMLAnchorElement>, visibility: 'Public'|'Hidden')
    {
        ev.preventDefault()
        // this.setState({visibility, visDropDownOpen: false})
    }

    private _handleImageSelected(file: File|null)
    {
        this.setState({file: file || undefined})
    }

    render()
    {
        return (
            <Dialog visible={this.props.visible}>
                <div className='modal-body'>
                    <div className='modal-header'>Create Map</div>
                    <div className='form-group'>
                        <label>Title</label>
                        <input type='text' className='form-control' onChange={ev => this._handleTitleChanged(ev)} placeholder='New Map'/>
                    </div>
                    <div className='form-group'>
                        <label>Slug</label>
                        <div className='input-group'>
                            <div className='input-group-prepend'>
                                <span className='input-group-text'>/maps/m/</span>
                            </div>
                            <input ref='slug' type='text' className='form-control' onChange={ev => this._handleSlugChanged(ev)} placeholder={NewMapDialog._makeSlug(this.state.title)}/>
                        </div>
                    </div>
                    <ImageSelect className='form-group' onImageSelected={file => this._handleImageSelected(file)}/>
                </div>
                <div className='modal-footer'>
                    <button className='btn btn-secondary pull-left' onClick={ev => this._handleCancelClicked(ev)}><i className='fa fa-ban'></i> Cancel</button>
                    <SaveButton icon='plus' title='Create' working='Creating' saving={!!this.state.saving} onClick={() => this._handleSubmitClicked()}/>
                </div>
            </Dialog>
        )
    }
}

export function ShowNewMapDialog() {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const onCancel = ()=>{ReactDOM.unmountComponentAtNode(div); document.body.removeChild(div)}
    const onCreate = ()=>{document.location.reload(true)}
    ReactDOM.render(React.createElement(NewMapDialog, {onCancel, onCreate, visible: true}), div)
}
