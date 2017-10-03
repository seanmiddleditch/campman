import * as React from 'react'
import {Link} from 'react-router-dom'
import * as path from 'path'

export const FolderItem = (props: {path: string}) => (
    <div key={props.path} className='list-group-item'>
        <Link to={path.normalize('/media/' + props.path)}>{props.path}</Link>
    </div>
)
