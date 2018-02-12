import * as React from 'react'
import * as PropTypes from 'prop-types'
import {Content} from '../rpc'

interface ContentContext
{
    rpc: Content
}

interface Props
{
    rpc: Content
}
export class Application extends React.Component<Props> implements React.ChildContextProvider<ContentContext>
{
    static childContextTypes = {
        rpc: PropTypes.object
    }

    public getChildContext()
    {
        return {rpc: this.props.rpc}
    }

    public render()
    {
        return this.props.children
    }
}