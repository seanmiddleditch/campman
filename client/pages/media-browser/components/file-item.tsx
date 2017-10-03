import * as React from 'react';
import {MediaFile} from '../../../types/media-file'

export const FileItem = (props: {file: MediaFile, onClick: (file: MediaFile) => void}) => (
    <div key={props.file.url} className='list-group-item' onClick={() => props.onClick(props.file)}>
        <figure className='figure'>
            <img src={props.file.url} className='figure-img img-fluid rounded img-thumbnail' style={{width: '100px'}} alt={props.file.caption}/>
            <figcaption className='figure-caption'>{props.file.caption || props.file.path}</figcaption>
        </figure>
    </div>
)
