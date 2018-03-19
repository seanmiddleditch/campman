import * as React from 'react'
import * as PropTypes from 'prop-types'
import { State } from '../state'

export type SetState = (action: (sttae: State) => State) => void

interface Props
{
    initialState: Readonly<State>
}
interface ComponentState
{
    state: State
}
interface Context
{
    state: Readonly<State>
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
            setState: (action: (state: State) => State) => {
                this.setState({state: action(this.state.state)})
            }
        }
    }

    public render()
    {
        return this.props.children
    }
}

export class StateConsumer extends React.Component<{render: (state: State, setState: SetState) => React.ReactNode}>
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