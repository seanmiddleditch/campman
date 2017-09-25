import * as React from 'react';
import Modal, {ModalBody, ModalHeader} from '../../../components/modal'

require('../styles/popup.css')

const copyToClipboard = (text: string) => {
    alert(`FIXME: copy to clipboard: ${text}`)
}

const ImagePopup = (props: {url?: string, onClose: () => void}) => (
    <div className='media-browser-image-popup'>
        <Modal visible={!!props.url} backdrop='visible' onClose={props.onClose}>
            <ModalHeader>
                <div className='input-group' onClick={() => copyToClipboard(props.url)}>
                    <span className='input-group-addon'><i className='fa fa-clipboard'/></span>
                    <input className='form-control' type='text' disabled value={props.url}/>
                </div>
            </ModalHeader>
            <ModalBody>
                <img src={props.url} alt={props.url} className='popup-img img-responsive'/>
            </ModalBody>
        </Modal>
    </div>
)
export default ImagePopup