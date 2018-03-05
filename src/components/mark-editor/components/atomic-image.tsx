import * as React from 'react'

export function AtomicImage(props: {blockProps: {url: string}})
{
    const {url} = props.blockProps
    return (
        <img className='img-fluid rounded' src={url} alt='image'/>
    )
}
