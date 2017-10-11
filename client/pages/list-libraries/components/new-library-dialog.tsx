import * as React from 'react';

import {Modal, ModalHeader, ModalFooter, ModalBody} from '../../../components/modal';

export interface NewLibraryDialogProps
{
    visible?: boolean
    disabled?: boolean
    onClose: () => void
    onCreate: (note: {slug: string, title: string}) => void
}
export class NewLibraryDialog extends React.Component<NewLibraryDialogProps>
{
    refs: {
        slug: HTMLInputElement
        title: HTMLInputElement
    }

    private _handleCreateClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        const title = this.refs.title.value;
        const slug = this.refs.slug.value || this.refs.slug.placeholder;
        this.props.onCreate({slug, title});
    }

    private _handleTitleChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        const title = ev.target.value.length ? ev.target.value : ev.target.placeholder;
        this.refs.slug.placeholder = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').slice(0, 32).trim().replace(/ /g, '-');
    }

    render()
    {
        return (
            <Modal visible={this.props.visible}>
                <ModalHeader>
                    New Library
                </ModalHeader>
                <ModalBody>
                    <div className='form-group'>
                        <label htmlFor='title'>Title</label>
                        <input className='form-control' ref='title' type='text' disabled={this.props.disabled} placeholder='My Library' onChange={ev => this._handleTitleChanged(ev)}/>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='slug'>Slug</label>
                        <input className='form-control' ref='slug' type='text' disabled={this.props.disabled} placeholder='my-library'/>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button className='btn btn-secondary' disabled={this.props.disabled} onClick={() => this.props.onClose()}>Cancel</button>
                    <button className='btn btn-primary' disabled={this.props.disabled} onClick={ev => this._handleCreateClicked(ev)}>Create Library</button>
                </ModalFooter>
            </Modal>
        )
    }
}
