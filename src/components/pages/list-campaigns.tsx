import * as React from 'react'
import {CampaignData} from '../../types'
import {Dialog} from '../dialog'

interface Props
{
    campaigns: CampaignData[]
    canCreate: boolean
}
export class ListCampaigns extends React.Component<Props>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {adding: false}
    }

    public render()
    {
        return (
            <div>
                <h1>Campaigns</h1>
                <div className='list-group'>
                    {this.props.campaigns.map(camp => (
                        <a key={camp.slug} href={camp.url} className='list-group-item'>
                            <div className='list-item-name'><i className='fa fa-file'></i> {camp.title}</div>
                            <div className='list-item-details'>{camp.url}</div>
                        </a>
                    ))}
                    {this.props.campaigns.length === 0 && <div className='list-group-item'>No campaigns found</div>}
                    {this.props.canCreate && <div className='list-group-item'>
                        <a href='/new-campaign' className='btn btn-primary'>
                            <i className='fa fa-plus'></i> Start New Campaign
                        </a>
                    </div>}
                </div>
            </div>
        )
    }
}