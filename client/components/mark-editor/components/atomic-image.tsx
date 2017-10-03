import * as React from 'react'

export const AtomicImage = (props: {blockProps: {url: string}}) => (
    <img className='img-fluid rounded' src={props.blockProps.url} alt='image'/>
)
