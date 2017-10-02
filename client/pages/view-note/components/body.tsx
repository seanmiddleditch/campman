import * as React from 'react'
import * as ReactRouter from 'react-router'
import * as PropTypes from 'prop-types'

import MarkEditor from '../../../components/mark-editor'

export interface BodyProps
{
    rawbody: Object
}
export default class Body extends React.Component<BodyProps>
{
    static contextTypes = { router: PropTypes.object.isRequired }
    
    context: ReactRouter.RouterChildContext<BodyProps>

    render()
    {
        return (
            <div className='note-body'>
                <MarkEditor disabled={true} editable={false} document={this.props.rawbody} onChange={()=>{}}/>
            </div>
        )
    }
}