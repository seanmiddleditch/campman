import * as React from 'react'
import {config} from '../api/config'

export const ImageThumb = ({className, hash, size, alt, caption}: {className?: string, hash: string, size: number, alt?: string, caption?: string}) => {
    const url = new URL(`/img/thumb/${size}/${hash}.png`, config.publicURL.toString())
    url.hostname = `media.${url.hostname}`
    return <div className={className} style={{position: 'relative', width: `${size}px`, height: `${size}px`, overflow: 'hidden'}}>
        {caption && <div style={{position: 'absolute', left: '12px', right: '12px', top: '12px', color: '#EEE', textShadow: '0px 0px 2px #000', overflow: 'hidden', textOverflow: 'ellipses', whiteSpace: 'nowrap'}}>{caption}</div>}
        <img src={url.toString()} width={size} alt={alt}/>
    </div>
}