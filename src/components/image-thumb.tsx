import * as React from 'react'

const wrapperStyle = (size: number) => ({
    position: 'relative',
    width: `${size}px`,
    height: `${size}px`,
    overflow: 'hidden',
} as React.CSSProperties)
const captionStyle: React.CSSProperties = {
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    textShadow: '1px 1px black',
    padding: 4,
    paddingLeft: 12,
    paddingRight: 12,
    position: 'absolute',
    bottom: '12px',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipses',
    whiteSpace: 'nowrap'
}

export const ImageThumb = ({className, hash, size, alt, caption}: {className?: string, hash: string, size: number, alt?: string, caption?: string}) => {
    return <div className={className} style={wrapperStyle(size)}>
        {caption && <div style={captionStyle}>{caption}</div>}
        <img src={`/media/img/thumb/${size}/${hash}.png`} width={size} alt={alt}/>
    </div>
}