import * as React from 'react'

interface Props
{
    timeout?: number
    children?: never
}
interface State
{
    visible: boolean
}
export class LoadSpinner extends React.Component<Props, State>
{
    state: State = {
        visible: false
    }

    _timeoutId: number|undefined = undefined

    private _expired()
    {
        this._timeoutId = undefined
        this.setState({visible: true})
    }

    public componentDidMount()
    {
        const timeout = this.props.timeout === undefined ? 1000 : this.props.timeout
        this._timeoutId = window.setTimeout(() => this._expired(), timeout)
    }

    public componentWillUnmount()
    {
        if (this._timeoutId)
            clearTimeout(this._timeoutId)
    }

    public render()
    {
        if (this.state.visible)
            return <div className='text-center mt-8'><i className='fa fa-spinner fa-spin fa-3x fa-fw'></i></div>
        else
            return <div/>
    }
}