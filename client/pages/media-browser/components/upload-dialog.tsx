import * as React from 'react'
import * as JQuery from 'jquery'
import {Link} from 'react-router-dom'
import * as api from '../../../api'
import * as path from 'path'

import Modal, {ModalHeader, ModalBody, ModalFooter} from '../../../components/modal'

export interface MediaBrowserPageProps
{
    onClose: () => void
    onUpload: (file: File) => void
    disabled?: boolean
    visible?: boolean
}
export default class MediaBrowserPage extends React.Component<MediaBrowserPageProps>
{
    refs: {
        file: HTMLInputElement,
        image: HTMLImageElement,
        modal: HTMLDivElement
    };

    private _handleFileSelect(ev: React.ChangeEvent<HTMLInputElement>)
    {
        const file = ev.target.files[0]
        const img = this.refs.image
        img.src = window.URL.createObjectURL(file)
    }

    private _handleClick(ev: React.MouseEvent<HTMLButtonElement>)
    {
        const file = this.refs.file.files[0]
        this.props.onUpload(file)
    }

    render()
    {
        return (
            <Modal visible={this.props.visible}>
                <ModalHeader>
                    New Media
                </ModalHeader>
                <ModalBody>
                    <div className='form-group'>
                        <img ref='image' style={{maxWidth: '100%'}} className='img-responsive'/>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='file'>File</label>
                        <input ref='file' className='form-control' id='file' type='file' disabled={this.props.disabled} onChange={ev => this._handleFileSelect(ev)}/>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button className='btn btn-secondary' onClick={() => this.props.onClose()}>Cancel</button>
                    <button className='btn btn-primary' disabled={this.props.disabled} onClick={ev => this._handleClick(ev)}>Upload</button>
                </ModalFooter>
            </Modal>
        )
    }
}