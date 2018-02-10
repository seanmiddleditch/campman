import * as React from 'react'
import {config} from '../api/config'

export const ImageThumb = ({hash, size, altText}: {hash: string, size: number, altText?: string}) => {
    const url = new URL(`/img/thumb/${size}/${hash}.png`, config.publicURL.toString())
    url.hostname = `media.${url.hostname}`
    return <div style={{width: `${size}px`, height: `${size}px`, overflow: 'hidden'}}><img src={url.toString()} width={size} alt={altText}/></div>
}