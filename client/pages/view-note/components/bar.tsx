import * as React from 'react'

export default function Bar(props: {onEdit: () => void, onDelete: () => void})
{
    return (
        <div className='float-right'>
            <div style={{position: 'sticky'}}>
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
