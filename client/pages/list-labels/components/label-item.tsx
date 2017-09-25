import * as React from 'react'
import {Link} from 'react-router-dom'

export default function LabelItem(props: {label: {slug?: string, numNotes?: number}})
{
    const {label} = props;
    return <Link key={label.slug} to={'/l/' + label.slug} className='list-group-item'>
        <div className='list-item-name'><i className='fa fa-tag'></i> {label.slug} <span className='badge badge-secondary'>{label.numNotes || 0}</span></div>
    </Link>
}