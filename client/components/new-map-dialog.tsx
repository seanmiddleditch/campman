import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {Dialog} from './dialog'
import {ImageSelect} from './image-select'

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

    private _handleSubmitClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        ev.preventDefault()
        // if (!this.state.saving)
        // {
        //     const saving = fetch('/wiki', {
        //         method: 'POST',
        //         mode: 'same-origin',
        //         credentials: 'include',
        //         headers: new Headers({
        //             'Content-Type': 'application/json',
        //             'Accept': 'application/json'
        //         }),
        //         body: JSON.stringify({
        //             slug: this.state.slug,
        //             title: this.state.title,
        //             labels: this.state.tags,
        //             visibility: this.state.visibility,
        //             rawbody: this.state.document
        //         })
        //     }).then(async (response) => {
        //         if (!response.ok)
        //             throw new Error(response.statusText)
        //         else if (response.status !== 200)
        //             throw new Error(response.statusText)

        //         const body = await response.json()
        //         if (body.status !== 'success')
        //             throw new Error(body.status)
        //         else
        //             document.location.href = body.location
        //         this.setState({saving: undefined})
        //     }).catch(err => {
        //         alert(err)
        //         this.setState({saving: undefined})
        //     })
        //     this.setState({saving})
        // }
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

    private _handleImageSelected(file: File)
    {

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
                    <ImageSelect className='form-group' onImageSelected={({file, thumbnail}) => this._handleImageSelected(file)}/>
                </div>
                <div className='modal-footer'>
                    <button className='btn btn-secondary pull-left' onClick={ev => this._handleCancelClicked(ev)}><i className='fa fa-ban'></i> Cancel</button>
                    <button className='btn btn-primary' disabled={!this.state.file} onClick={ev => this._handleSubmitClicked(ev)}><i className='fa fa-plus'></i> Create</button>
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
