import * as React from 'react'
import * as JQuery from 'jquery'
import {Link} from 'react-router-dom'
import * as api from '../../../api'
import * as path from 'path'

import Modal, {ModalHeader, ModalBody, ModalFooter} from '../../../components/modal'

require('../styles/upload.css')

export interface UploadDialogProps
{
    onClose: () => void
    onUpload: ({file: File, caption: string}) => void
    disabled?: boolean
    visible?: boolean
}
interface UploadDialogState
{
    file?: File,
    caption: string
}
export default class UploadDialog extends React.Component<UploadDialogProps, UploadDialogState>
{
    refs: {
        file: HTMLInputElement,
        image: HTMLImageElement,
        modal: HTMLDivElement
    };

    constructor(props: UploadDialogProps)
    {
        super(props)
        this.state = {caption: ''}
    }

    private _handleFileSelect(ev: React.ChangeEvent<HTMLInputElement>)
    {
        const file = ev.target.files[0]
        this.setState({file})
    }

    private _handleCaptionChange(ev: React.ChangeEvent<HTMLInputElement>)
    {
        this.setState({caption: ev.target.value})
    }

    private _handleCancelClick()
    {
        this.setState({file: undefined})
        this.props.onClose()
    }

    private _handleUploadClick(ev: React.MouseEvent<HTMLButtonElement>)
    {
        if (this.state.file)
        {
            const {file, caption} = this.state
            this.props.onUpload({file, caption})
        }
    }

    componentWillReceiveProps(nextProps: UploadDialogProps)
    {
        // reset any file handle
        if (!nextProps.visible && !this.state.file)
            this.setState({file: undefined})
    }

    render()
    {
        return (
            <div className='media-browser-upload-dialog'>
                <Modal visible={this.props.visible}>
                    <ModalHeader>
                        New Media
                    </ModalHeader>
                    <ModalBody>
                        {this.state.file && (
                            <div className='form-group'>
                                <img style={{maxWidth: '100%'}} className='img-responsive' src={window.URL.createObjectURL(this.state.file)}/>
                            </div>
                        )}
                        {!this.state.file && (
                            <div className='form-group'>
                                <label htmlFor='file' className='btn btn-primary'><i className='fa fa-image-o'></i> Select File</label>
                                <input ref='file' className='form-control' id='file' type='file' disabled={this.props.disabled} onChange={ev => this._handleFileSelect(ev)}/>
                            </div>
                        )}
                        <div className='form-group'>
                            <label htmlFor='caption'>Caption</label>
                            <input ref='caption' className='form-control' id='caption' type='text' disabled={this.props.disabled} placeholder={this.state.file ? this.state.file.name : 'Description of file'} onChange={ev => this._handleCaptionChange(ev)}/>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <button className='btn btn-secondary' onClick={() => this._handleCancelClick()}>Cancel</button>
                        <button className='btn btn-primary' disabled={this.props.disabled || !this.state.file} onClick={ev => this._handleUploadClick(ev)}><i className='fa fa-cloud-upload'></i> Upload</button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}