import * as React from 'react'
import { ImageThumb } from '../image-thumb'
import { MapData } from '../../types'

const style = (size: number) => ({
    width: `${size+1}px`,
    height: `${size+1}px`,
    borderRadius: 8,
    margin: 24,
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid rgba(0, 0, 0, 0.3)'
} as React.CSSProperties)

interface Props
{
    maps: MapData[]
    canCreate: boolean
}
export class ListMaps extends React.Component<Props>
{
    public render()
    {
        const {maps, canCreate} = this.props
        return (<div>
            {canCreate && <a href='/new-map' className='btn btn-primary'>
                <i className='fa fa-plus'></i> New Map
            </a>}
            <div className='clearfix'>
                {maps.map(map => (
                    <a key={map.id} href={`/maps/m/${map.slug}`}>
                        <div className='pull-left' style={style(400)}>
                            <ImageThumb hash={map.storage.contentMD5} size={400} caption={map.title}/>
                        </div>
                    </a>
                ))}
            </div>
            {maps.length === 0 && <div className='alert alert-warning'>No results</div>}
        </div>)
    }
}