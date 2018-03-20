import * as React from 'react'
import { CampaignData } from '../../types'
import { Link } from 'react-router-dom'
import { CampaignsContainer } from '../containers/campaigns'
import { Authenticated } from '../containers/authenticated';

export const ListCampaigns: React.SFC = () =>
    <div>
        <h1>Campaigns</h1>
        <div className='list-group'>
            <CampaignsContainer render={campaigns => <div>
                {Array.from(campaigns.entries()).map(([_, camp]) => (
                    <a key={camp.slug} href={camp.url} className='list-group-item'>
                        <div className='list-item-name'><i className='fa fa-file'></i> {camp.title}</div>
                        <div className='list-item-details'>{camp.url}</div>
                    </a>
                ))}
                {campaigns.length === 0 && <div className='list-group-item'>No campaigns found</div>}
                <Authenticated render={({profile}) => profile &&
                    <div className='list-group-item'>
                        <Link to='/new-campaign' className='btn btn-primary'>
                            <i className='fa fa-plus'></i> Start New Campaign
                        </Link>
                    </div>
                }/>
            </div>}/>
        </div>
    </div>