import * as React from 'react'

export const ImageLink = ({className, hash, extension, alt, children}: {className?: string, hash: string, extension: string, alt?: string, children?: JSX.Element}) => {
    return <a href={`/media/img/full/${hash}.${extension}`} className={className} title={alt}>{children}</a>
}