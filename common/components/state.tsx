import * as React from 'react'
import * as PropTypes from 'prop-types'
import {Config} from '../types/config'

interface State
{
    config: Config
}

export class StateProvider extends React.Component<{state: State}> implements React.ChildContextProvider<{state: State}>
{
    static childContextTypes = {
        state: PropTypes.object
    }

    public getChildContext()
    {
        return {state: this.props.state}
    }

    public render()
    {
        return this.props.children
    }
}

export class StateConsumer extends React.Component<{render: (state: State) => JSX.Element}>
{
    context: {
        state: State
    }
    static contextTypes = {
        state: PropTypes.object
    }

    public render()
    {
        return this.props.render(this.context.state)
    }
}