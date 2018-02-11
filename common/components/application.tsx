import * as React from 'react'
import * as PropTypes from 'prop-types'
import {Content} from '../rpc'
import {API} from '../../client/api'

interface ContentContext
{
    rpc: Content
}

export class Application extends React.Component<void> implements React.ChildContextProvider<ContentContext>
{
    private _api = new API()

    static childContextTypes = {
        rpc: PropTypes.object
    }

    public getChildContext()
    {
        return {rpc: this._api}
    }

    public render()
    {
        return this.props.children
    }
}