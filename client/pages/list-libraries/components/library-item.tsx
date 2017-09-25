import * as React from 'react';

export default function LibraryItem(props: {library: {slug?: string, title?: string}, publicURL: string})
{
    const {library, publicURL} = props;
    const url = new URL(publicURL);
    url.hostname = `${library.slug}.${url.hostname}`;
    const target = url.toString();

    return (
        <a key={library.slug} href={target} className='list-group-item'>
            <div className='list-item-name'><i className='fa fa-file'></i> {library.title}</div>
            <div className='list-item-details'>{target}</div>
        </a>
    )
}