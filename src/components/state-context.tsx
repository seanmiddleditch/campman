import * as React from 'react'
import * as PropTypes from 'prop-types'
import { State } from '../state'

type SetState = (state: Partial<State>) => void

interface Props
{
    initialState: State
}
interface ComponentState
{
    state: State
}
interface Context
{
    state: State
    setState: SetState
}
export class StateProvider extends React.Component<Props, ComponentState> implements React.ChildContextProvider<Context>
{
    static childContextTypes = {
        state: PropTypes.object,
        setState: PropTypes.func
    }

    constructor(props: Props)
    {
        super(props)
        this.state = {state: {...props.initialState}}
    }

    public getChildContext()
    {
        return {
            state: this.state.state,
            setState: (state: Partial<State>) => this.setState({state: {...this.state.state, state}})
        }
    }

    public render()
    {
        return this.props.children
    }
}

export class StateConsumer extends React.Component<{render: (state: State, setState: SetState) => JSX.Element}>
{
    context: Context
    static contextTypes = {
        state: PropTypes.object,
        setState: PropTypes.func
    }

    public render()
    {
        return this.props.render(this.context.state, this.context.setState)
    }
}