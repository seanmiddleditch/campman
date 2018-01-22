import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as $ from 'jquery'
import {MediaAPI} from '../api/media-api'

interface MediaFile {
    url: string
    thumb_url: string
    path: string
}

interface Props {
    onCancel: () => void
    onUpload: (media: MediaFile) => void
    visible?: boolean
}
interface State {
    file?: File
    thumbnail?: Blob
    onbjectURL?: string
    upload?: Promise<void>
    caption?: string
    path?: string
    error?: string
}
export class MediaUploadDialog extends React.Component<Props, State>
{
    private _media = new MediaAPI()
    private _visible = false
    
    ref: {
        preview: HTMLImageElement,
        dialog: HTMLDivElement
    }

    constructor(props: Props) {
        super(props)
        this.state = {}
    }

    private _show() {
        if (!this._visible) {
            this._visible = true;
            ($(this.refs.dialog) as any).modal('show')
        }
    }

    private _hide() {
        if (this._visible) {
            this._visible = false;
            ($(this.refs.dialog) as any).modal('hide')
        }
    }

    componentDidMount() {
        if (this.props.visible)
            this._show()
    }

    componentWillUnmount() {
        this._hide()

        if (this.state.onbjectURL)
            URL.revokeObjectURL(this.state.onbjectURL)
    }

    componentDidUpdate() {
        if (this.props.visible)
            this._show()
        else
            this._hide()
    }

    private async _generateThumbnail(file: File) : Promise<Blob>
    {
        const image = document.createElement('img')

        const {width, height} = await (async () => {
            const dataURL = URL.createObjectURL(file)
            try
            {
                // load into an image so we can extract the width and height
                image.src = dataURL
                await new Promise(resolve => image.onload = () => resolve())
                const width = image.width
                const height = image.height
                URL.revokeObjectURL(dataURL)

                return {width, height}
            }
            catch (e)
            {
                URL.revokeObjectURL(dataURL)
                throw e
            }
        })()

        // determine thumbnail size
        const targetMaxDimension = 200
        const {newWidth, newHeight} = (() => {
            if (width > height)
            {
                const newWidth = Math.min(targetMaxDimension, width)
                const newHeight = height * newWidth / width
                return {newWidth, newHeight}
            }
            else
            {
                const newHeight = Math.min(targetMaxDimension, height)
                const newWidth = width * newHeight / height
                return {newWidth, newHeight}
            }
        })()

        // if the thumbnail i sno smaller than the original, don't do anything else
        if (newWidth === width || newHeight === height)
            return file

        // scale down the image
        const canvas = document.createElement('canvas')
        canvas.width = newWidth
        canvas.height = newHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height)

        // extract a PNG of the image
        const thumbnail = await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob)))
        return thumbnail
    }
    
    private _onFileChanged(ev: React.ChangeEvent<HTMLInputElement>) {
        if (this.state.onbjectURL)
            URL.revokeObjectURL(this.state.onbjectURL)

        if (ev.target.files.length == 1)
        {
            const file = ev.target.files[0]
            this._generateThumbnail(file).then(thumbnail => {
                this.setState({
                    file,
                    thumbnail,
                    onbjectURL: URL.createObjectURL(file)
                })
            })
        } else {
            this.setState({file: undefined, thumbnail: undefined, onbjectURL: undefined})
        }
        
    }

    private _onPathChanged(ev: React.ChangeEvent<HTMLInputElement>) {
        this.setState({path: ev.target.value || undefined})
    }

    private _onCaptionChanged(ev: React.ChangeEvent<HTMLInputElement>) {
        this.setState({caption: ev.target.value || undefined})
    }

    private _onCancelClicked(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.preventDefault()
        this.props.onCancel()
    }

    private _onUploadClicked(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.preventDefault()
        const {file, thumbnail, path, caption} = this.state
        const upload = this._media.upload({file, thumbnail, path, caption}).then(({url, thumb_url, path}) => {
            this.setState({upload: undefined})
            this.props.onUpload({url, thumb_url, path})
        }).catch(e => {
            this.setState({
                upload: undefined,
                error: e.toString()
            })
        })
        this.setState({upload})
    }

    render() {
        return (
            <div ref='dialog' className='modal' data-backdrop='static' role='dialog'>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>Upload Media</div>
                        <div className='modal-body'>
                            {this.state.error && (<div className='form-group'>
                                <span className='error text-danger'><i className='fa fa-exclamation-triangle'></i> {this.state.error}</span>
                            </div>)}
                            <div className='form-group'>
                                <img ref='preview' style={{maxWidth: '100%'}} className='img-responsive img-preview' src={this.state.onbjectURL}/>
                            </div>
                            <div className='form-group'>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <label htmlFor='media-upload-file' className='btn btn-secondary input-group-text'><i className='fa fa-file-image-o'></i>&nbsp;Select File</label>
                                    </div>
                                    <input ref='file' id='media-upload-file' type='file' style={{display: 'none'}} onChange={ev => this._onFileChanged(ev)} disabled={!!this.state.upload}/>
                                    <input ref='path' type='text' className='form-control' disabled={!this.state.file || !!this.state.upload} placeholder={this.state.file ? `/${this.state.file.name}` : 'please select a file'} onChange={ev => this._onPathChanged(ev)}/>
                                </div>
                            </div>
                            <div className='form-group'>
                                <label htmlFor='caption'>Caption</label>
                                <input className='form-control' type='text' placeholder='Description of file' disabled={!!this.state.upload} onChange={ev => this._onCaptionChanged(ev)}/>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button className='btn btn-secondary btn-cancel' disabled={!!this.state.upload} onClick={ev => this._onCancelClicked(ev)}>Cancel</button>
                            <button className='btn btn-primary btn-upload' disabled={!this.state.file || !!this.state.upload} onClick={ev => this._onUploadClicked(ev)}><i className={'fa ' + (this.state.upload ? 'fa-spinner fa-spin' : 'fa-cloud-upload')}></i> Upload</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export function ShowMediaUploadDialog() {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const onCancel = ()=>{ReactDOM.unmountComponentAtNode(div); document.body.removeChild(div)}
    const onUpload = ()=>{document.location.reload(true)}
    ReactDOM.render(React.createElement(MediaUploadDialog, {onCancel, onUpload, visible: true}), div)
}