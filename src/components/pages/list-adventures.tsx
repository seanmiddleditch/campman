import * as React from 'react'
import { AdventureData } from '../../types'
import { AdventuresContainer } from '../containers/adventures'
import { LocalDate } from '../local-date'
import { Link } from 'react-router-dom'

export class ListAdventures extends React.PureComponent
{
    public render()
    {
        return (
            <div>
                <h1>Adventures</h1>
                <div className='list-group list-group-flush'>
                    <AdventuresContainer>{({adventures}) =>
                        adventures && adventures.length !== 0 ?
                            adventures.map(adv => (
                                <Link key={adv.id} to={`/adventures/${adv.id}`} className='list-group-item'>
                                    <div className='list-item-name'><i className='fa fa-file'></i> {adv.title}</div>
                                    <div className='list-item-details'><LocalDate date={adv.created_at}/></div>
                                </Link>
                            )) :
                            <div className='list-group-item'>No adventures have yet been had</div>
                    }</AdventuresContainer>
                    <div className='list-group-item'>
                        <Link to='/new-adventure' className='btn btn-primary'>
                            <i className='fa fa-plus'></i> Post New Adventure
                        </Link>
                    </div>
                </div>
            </div>
        )
    }
}
