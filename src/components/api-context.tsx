import * as React from 'react'
import * as PropTypes from 'prop-types'
import {API} from '../types/api'

export class APIProvider extends React.Component<{api: API}> implements React.ChildContextProvider<{api: API}>
{
    static childContextTypes = {
        api: PropTypes.object
    }

    public getChildContext()
    {
        return {api: this.props.api}
    }

    public render()
    {
        return this.props.children
    }
}

export class APIConsumer extends React.Component<{render: (api: API) => JSX.Element}>
{
    context: {
        api: API
    }
    static contextTypes = {
        api: PropTypes.object
    }

    public render()
    {
        return this.props.render(this.context.api)
    }
}