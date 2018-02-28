import * as React from 'react'
import {CampaignData} from '../../types'
import {Dialog} from '../dialog'
import {NewCampaignForm} from '../forms/new-campaign-form'

interface Props
{
    campaigns: CampaignData[]
    canCreate: boolean
}
interface State
{
    adding: boolean
}
export class ListCampaigns extends React.Component<Props, State>
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
                <Dialog visible={this.state.adding}>
                    <div className='modal-body'>
                        <NewCampaignForm/>
                    </div>
                </Dialog>
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
                        <button onClick={() => this.setState({adding: true})} className='btn btn-primary'>
                            <i className='fa fa-plus'></i> Start New Campaign
                        </button>
                    </div>}
                </div>
            </div>
        )
    }
}