import * as React from 'react'

interface Props
{
    children?: any
    visible?: boolean
}
interface State {}

export class Dialog extends React.Component<Props, State>
{
    private _visible: boolean = false

    private _show() {
        if (!this._visible) {
            this._visible = true;
            const dialog = $(this.refs.dialog) as any
            dialog.modal('show')
        }
    }

    private async _hide() {
        if (this._visible) {
            this._visible = false;
            const dialog = $(this.refs.dialog) as any
            dialog.modal('hide')
        }
    }

    componentDidMount() {
        if (this.props.visible)
            this._show()
    }

    componentWillUnmount() {
        this._hide()
    }

    componentDidUpdate() {
        if (this.props.visible)
            this._show()
        else
            this._hide()
    }

    render()
    {
        return (
            <div>
                <div ref='dialog' className='modal' data-backdrop='static'>
                    <div className='modal-dialog modal-lg' role='document'>
                        <div className='modal-content'>
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}