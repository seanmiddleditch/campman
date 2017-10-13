import * as React from 'react'
import * as JQuery from 'jquery'

export interface ModalProps
{
    children: any
    visible?: boolean
    backdrop?: 'visible'|'hidden'|'static'
    onClose?: () => void
}
export class Modal extends React.Component<ModalProps>
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
        if (this.props.visible === undefined || this.props.visible)
        {
            this.show()
        }

        const modal = JQuery(this.refs.modalDiv) as any
        modal.on('hidden.bs.modal', () => {
            this.setState({visible: false})
            if (this.props.onClose)
                this.props.onClose()
            return this
        })
    }

    componentWillReceiveProps(nextProps: ModalProps)
    {
        if (nextProps.visible !== this.props.visible)
        {
            nextProps.visible ? this.show() : this.close()
        }
    }

    render()
    {
        return (
            <div>
                <div ref='modalDiv' className='modal' data-backdrop={this.props.backdrop == 'visible' ? true : this.props.backdrop == 'hidden' ? false : 'static'} role='dialog'>
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
)

export const ModalBody = (props: {children: any}) => (
    <div className='modal-body'>
        {props.children}
    </div>
)

export const ModalFooter = (props: {children: any}) => (
    <div className='modal-footer'>
        {props.children}
    </div>
)
