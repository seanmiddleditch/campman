import * as React from 'react'
import { ImageThumb } from '../../image-thumb'

interface Props
{
    hash: string
    size: number
}
export const ImageBlock: React.SFC<Props> = (props) => <ImageThumb {...props}/>