import * as React from 'react'
import { AdventureData } from '../../types'

interface Props
{
    adventures: AdventureData[]
    canCreate: boolean
}
export class ListAdventures extends React.Component<Props>
{
    public render()
    {
        return (
            <div>
                <h1>Adventures</h1>
                <div className='list-group'>
                    {this.props.adventures.map(adv => (
                        <a key={adv.id} href={`/adventures/${adv.id}`} className='list-group-item'>
                            <div className='list-item-name'><i className='fa fa-file'></i> {adv.title}</div>
                            <div className='list-item-details'>{adv.created_at}</div>
                        </a>
                    ))}
                    {this.props.adventures.length === 0 && <div className='list-group-item'>No adventures have yet been had</div>}
                    {this.props.canCreate && <div className='list-group-item'>
                        <a href='/new-adventure' className='btn btn-primary'>
                            <i className='fa fa-plus'></i> Post New Adventure
                        </a>
                    </div>}
                </div>
            </div>
        )
    }
}
