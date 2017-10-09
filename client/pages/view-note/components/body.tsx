import * as React from 'react'
import * as ReactRouter from 'react-router'
import * as PropTypes from 'prop-types'

export interface BodyProps
{
    body: string
}
export class Body extends React.Component<BodyProps>
{
    static contextTypes = { router: PropTypes.object.isRequired }
    
    context: ReactRouter.RouterChildContext<BodyProps>

    render()
    {
        return (
            <div className='note-body' dangerouslySetInnerHTML={{__html: this.props.body}}></div>
        )
    }
}