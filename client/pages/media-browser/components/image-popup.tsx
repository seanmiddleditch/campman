import * as React from 'react';
import {Modal, ModalBody, ModalHeader} from '../../../components/modal'

import {MediaFile} from '../../../types/media-file'

require('../styles/popup.css')

const copyToClipboard = (text: string) => {
    alert(`FIXME: copy to clipboard: ${text}`)
}

export const ImagePopup = (props: {file?: MediaFile, onClose: () => void}) => (
    <div className='media-browser-image-popup'>
        <Modal visible={!!props.file} backdrop='visible' onClose={props.onClose}>
            <ModalHeader>
                <div className='input-group' onClick={() => copyToClipboard(props.file.url)}>
                    <span className='input-group-addon'><i className='fa fa-clipboard'/></span>
                    <input className='form-control' type='text' disabled value={props.file && props.file.url}/>
                </div>
            </ModalHeader>
            <ModalBody>
                <img src={props.file && props.file.url} alt={props.file && props.file.caption} className='popup-img img-responsive'/>
                {props.file && props.file.caption && <div>{props.file && props.file.caption}</div>}
            </ModalBody>
        </Modal>
    </div>
)
