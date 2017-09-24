import * as React from 'react';
import * as JQuery from 'jquery';

export interface ModalProps
{
    children: any
    visible?: boolean
}
export default class Modal extends React.Component<ModalProps>
{
    refs: {
        modalDiv: HTMLDivElement
    }

    show() : Promise<Modal>
    {
        const modal = JQuery(this.refs.modalDiv) as any
        return new Promise<Modal>(resolve => {
            modal.one('shown.bs.modal', () => resolve(this))
            modal.modal('show')
        })
    }

    close()
    {
        return new Promise<Modal>(resolve => {
            const modal = JQuery(this.refs.modalDiv) as any
            modal.one('hidden.bs.modal', () => resolve(this)).modal('hide')
            modal.modal('hide')
        })
    }

    componentDidMount()
    {
        if (this.props.visible)
        {
            this.show();
        }
    }

    componentWillReceiveProps(nextProps: ModalProps)
    {
        if (nextProps.visible !== this.props.visible)
        {
            nextProps.visible ? this.show() : this.close();
        }
    }

    render()
    {
        return (
            <div>
                <div ref='modalDiv' className='modal' data-backdrop='static' role='dialog'>
                    <div className='modal-dialog' role='document'>
                        <div className='modal-content'>
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export const ModalHeader = (props: {children?: any}) => (
    <div className='modal-header'>
        {props.children}
    </div>
);

export const ModalBody = (props: {children: any}) => (
    <div className='modal-body'>
        {props.children}
    </div>
);

export const ModalFooter = (props: {children: any}) => (
    <div className='modal-footer'>
        {props.children}
    </div>
);
