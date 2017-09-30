import * as React from 'react'
import * as ReactRouter from 'react-router'
import * as PropTypes from 'prop-types'

import Markdown from '../../../components/markdown'

export interface BodyProps
{
    body: string
}
export default class Body extends React.Component<BodyProps>
{
    static contextTypes = { router: PropTypes.object.isRequired }
    
    context: ReactRouter.RouterChildContext<BodyProps>

    render()
    {
        return (
            <div className='note-body'>
                <Markdown history={this.context.router.history} markup={this.props.body}/>
            </div>
        )
    }
}