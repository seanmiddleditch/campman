import * as React from 'react'
import {ImageLink} from '../image-link'
import {ImageThumb} from '../image-thumb'

interface Props
{
    map: any
}
export class ViewMap extends React.Component<Props>
{
    public render()
    {
        const {map} = this.props
        return (<div>
            <div>
                <ImageLink hash={map.storage.contentMD5} extension={map.storage.extension}>
                    <ImageThumb hash={map.storage.contentMD5} size={400} caption={map.title}/>
                </ImageLink>
            </div>
        </div>)
    }
}