import * as React from 'react';

const FileItem = (props: {url: string, onClick: (url: string) => void}) => (
    <div key={props.url} className='list-group-item' onClick={() => props.onClick(props.url)}>
        <figure className='figure'>
            <img src={props.url} className='figure-img img-fluid rounded img-thumbnail' style={{width: '100px'}} alt={props.url}/>
            <figcaption className='figure-caption'>{props.url}</figcaption>
        </figure>
    </div>
)
export default FileItem