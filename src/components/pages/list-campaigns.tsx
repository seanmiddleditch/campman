import * as React from 'react'
import { CampaignData } from '../../types'
import { Link } from 'react-router-dom'
import { CampaignsContainer } from '../containers/campaigns'
import { Authenticated } from '../containers/authenticated';

export const ListCampaigns: React.SFC = () =>
    <CampaignsContainer>{
        ({campaigns, fetching}) =>
            fetching ?
                <div className='text-center'><i className='fa fa-spinner fa-spin fa-3x fa-fw'></i></div> :
                <>
                    <h1>Campaigns</h1>
                    <div className='list-group list-group-flush'>
                        {campaigns && campaigns.length !== 0 ?
                            campaigns.map(camp => (
                                <a key={camp.slug} href={camp.url} className='list-group-item'>
                                    <div className='list-item-name'><i className='fa fa-file'></i> {camp.title}</div>
                                    <div className='list-item-details'>{camp.url}</div>
                                </a>
                            )) :
                            <div className='list-group-item'>No campaigns found</div>
                        }
                        <div className='list-group-item'>
                            <Link to='/new-campaign' className='btn btn-primary'>
                                <i className='fa fa-plus'></i> Start New Campaign
                            </Link>
                        </div>
                    </div>
                </>
    }</CampaignsContainer>