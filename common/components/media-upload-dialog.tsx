import * as React from 'react'
import { MediaFile } from '../types'
import { API } from '../types'
import { Dialog } from './dialog'
import { ImageSelect } from './image-select'
import { SaveButton } from './save-button'
import { MediaSelectDialog } from './media-select-dialog';
import { APIConsumer } from './api'

interface Props {
    onCancel: () => void
    onUpload: (media: MediaFile) => void
    visible?: boolean
}

interface PropsWithAPI extends Props
{
    api: API
}
interface State {
    file?: File
    upload?: Promise<void>
    caption?: string
    path?: string
    error?: string
}
class MediaUpload extends React.Component<PropsWithAPI, State>
{
    constructor(props: PropsWithAPI) {
        super(props)
        this.state = {}
    }

    private _onImageSelected(file: File | null) {
        this.setState({ file: file || undefined })
    }

    private _onPathChanged(path: string) {
        this.setState({ path })
    }

    private _onCaptionChanged(ev: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ caption: ev.target.value || undefined })
    }

    private _onCancelClicked(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.preventDefault()
        this.props.onCancel()
    }

    private _onUploadClicked() {
        const { file, path, caption } = this.state
        if (file) {
            const upload = this.props.api.uploadFile({ file, path, caption }).then(result => {
                this.setState({ upload: undefined })
                this.props.onUpload(result)
            }).catch((e: Error) => {
                this.setState({
                    upload: undefined,
                    error: e.toString()
                })
            })
            this.setState({ upload })
        }
    }

    render() {
        return (
            <Dialog visible={this.props.visible}>
                <div className='modal-header'>Upload Media</div>
                <div className='modal-body'>
                    {this.state.error && (<div className='form-group'>
                        <span className='error text-danger'><i className='fa fa-exclamation-triangle'></i> {this.state.error}</span>
                    </div>)}
                    <ImageSelect className='form-group' onImageSelected={file => this._onImageSelected(file)} onPathChanged={path => this._onPathChanged(path)} />
                    <div className='form-group'>
                        <label htmlFor='caption'>Caption</label>
                        <input className='form-control' type='text' placeholder='Description of file' disabled={!!this.state.upload} onChange={ev => this._onCaptionChanged(ev)} />
                    </div>
                </div>
                <div className='modal-footer'>
                    <button className='btn btn-secondary' disabled={!!this.state.upload} onClick={ev => this._onCancelClicked(ev)}>Cancel</button>
                    <SaveButton icon='cloud-upload' title='Upload' working='Uploading' disabled={!this.state.file || !!this.state.upload} saving={!!this.state.upload} onClick={() => this._onUploadClicked()} />
                </div>
            </Dialog>
        )
    }
}

export const MediaUploadDialog = (props: Props) => <APIConsumer render={api => <MediaUpload api={api} {...props}/>}/>