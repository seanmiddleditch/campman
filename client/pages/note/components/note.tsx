import * as React from 'react'
import * as ReactRouter from 'react-router'
import * as PropTypes from 'prop-types'

import Markdown from '../../../components/markdown'

import Labels from './labels'

interface NoteProps
{
    note: {
        slug?: string
        title?: string
        subtitle?: string
        labels?: string[]
        body?: string
    }
    onDelete: () => void
    onEdit: () => void
}
export default class Note extends React.Component<NoteProps>
{
    static contextTypes = { router: PropTypes.object.isRequired }
    
    context: ReactRouter.RouterChildContext<NoteProps>

    render()
    {
        const props = this.props
        const {note} = props

        return (
            <div className='note-page'>
                <div className='note-subtitle'>{note.subtitle}</div>
                <div className='note-labels'><Labels labels={note.labels}/></div>
                <div className='note-body'>
                    <Markdown history={this.context.router.history} markup={note.body}/>
                </div>
                <div>
                    <div className='btn-group'>
                        <button id='note-btn-edit' className='btn btn-default' about='Edit' onClick={() => props.onEdit()}><i className='fa fa-pencil'></i> Edit</button>
                        <div className='btn-group'>
                            <button className='btn dropdown-toggle dropdown-toggle-split' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'><span className='caret'/></button>
                            <div className='dropdown-menu'>
                                <button id='note-btn-delete btn-danger' className='dropdown-item btn-danger' about='Delete' onClick={() => props.onDelete()}><i className='fa fa-trash-o'></i> Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}