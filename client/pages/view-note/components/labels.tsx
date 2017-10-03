import * as React from 'react'

export function Labels(props: {labels?: string[]})
{
    const {labels} = props

    return (labels && labels.length) ? (
        <div className='note-labels'>
            <i className='fa fa-tags'></i>&nbsp;
            {labels.map(l => <span key={l}><span className='label note-label badge badge-pill badge-light'>{l}</span> </span>)}
        </div>
    ) : <span/>
}