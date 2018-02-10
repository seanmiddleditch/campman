import * as React from 'react'

export const ImageThumb = ({className, hash, size, alt, caption}: {className?: string, hash: string, size: number, alt?: string, caption?: string}) => {
    return <div className={className} style={{position: 'relative', width: `${size}px`, height: `${size}px`, overflow: 'hidden'}}>
        {caption && <div style={{position: 'absolute', left: '12px', right: '12px', top: '12px', color: '#EEE', textShadow: '0px 0px 2px #000', overflow: 'hidden', textOverflow: 'ellipses', whiteSpace: 'nowrap'}}>{caption}</div>}
        <img src={`/media/img/thumb/${size}/${hash}.png`} width={size} alt={alt}/>
    </div>
}