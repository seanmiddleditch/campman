import * as React from 'react'
import {ImageThumb} from '../image-thumb'

interface Props
{
    maps: any[]
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
            {(maps && maps.length) ? maps.map(map => (
                <a key={map.slug} href={`/maps/m/${map.slug}`}>
                    <div className='card float-left m-2' style={{width: '12rem', height: '14rem'}}>
                        <div style={{height: 140, overflow: 'hidden'}}>
                            <ImageThumb hash={map.storage.contentMD5} size={200} caption={map.title}/>
                        </div>
                        <div className='card-body'>
                            <h5 className='card-title'>{map.title}</h5>
                        </div>
                    </div>
                </a>
            )) :
                <div className='alert alert-warning'>No results</div>
            }
            </div>
        </div>)
    }
}