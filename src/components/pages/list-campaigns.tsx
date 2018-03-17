import * as React from 'react'
import { CampaignData } from '../../types'
import { State } from '../../state'
import { StateConsumer } from '../state-context'
import { Link } from 'react-router-dom'

const ListCampaignsComponet: React.SFC<{state: State}> = ({state}) =>
    <div>
        <h1>Campaigns</h1>
        <div className='list-group'>
            {Array.from(state.campaigns.entries()).map(([_, camp]) => (
                <a key={camp.slug} href={camp.url} className='list-group-item'>
                    <div className='list-item-name'><i className='fa fa-file'></i> {camp.title}</div>
                    <div className='list-item-details'>{camp.url}</div>
                </a>
            ))}
            {state.campaigns.size === 0 && <div className='list-group-item'>No campaigns found</div>}
            {state.profile && <div className='list-group-item'>
                <Link to='/new-campaign' className='btn btn-primary'>
                    <i className='fa fa-plus'></i> Start New Campaign
                </Link>
            </div>}
        </div>
    </div>

export const ListCampaigns: React.SFC<{}> = () => <StateConsumer render={state => <ListCampaignsComponet state={state}/>}/>