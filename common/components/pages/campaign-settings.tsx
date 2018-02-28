import * as React from 'react'
import {SaveButton} from '../save-button'
import {Content} from '../../rpc'
import * as PropTypes from 'prop-types'

interface Campaign
{
    title: string
    slug: string
    visibility: 'Public'|'Hidden'
}
interface Props
{
    campaign: Campaign
}
interface State
{
    campaign: Campaign
    message?: {
        type: 'success'|'danger'
        text: string
    }
    errors: {
        title?: string
        slug?: string
    }
    saving?: Promise<void>
}
export class CampaignSettings extends React.Component<Props, State>
{
    context: {
        rpc: Content
    }
    static contextTypes = {
        rpc: PropTypes.object
    }


    constructor(props: Props)
    {
        super(props)
        this.state = {
            errors: {},
            campaign: {
                title: props.campaign.title,
                slug: props.campaign.slug,
                visibility: props.campaign.visibility
            }
        }
    }

    private _handleTitleChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        ev.preventDefault()
        this.setState({campaign: {...this.state.campaign, title: ev.target.value}})
    }

    private _handleSlugChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        ev.preventDefault()
        this.setState({campaign: {...this.state.campaign, slug: ev.target.value}})
    }

    private _handleVisibilityChanged(ev: React.ChangeEvent<HTMLSelectElement>)
    {
        ev.preventDefault()
        this.setState({campaign: {...this.state.campaign, visibility: ev.target.value === 'Public' ? 'Public' : 'Hidden'}})
    }

    private _handleSubmit()
    {
        const promise = fetch('/settings', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                title: this.state.campaign.title,
                slug: this.state.campaign.slug,
                visibility: this.state.campaign.visibility
            })
        }).then(async (response) => {
            if (!response.ok)
                this.setState({message: {type: 'danger', text: 'Failed to save changes'}})
            
            const body = await response.json()
            if (body.status === 'success')
            {
                this.setState({saving: undefined, message: {type: 'success', text: 'Changes saved'}, errors: {}})
            }
            else
            {
                this.setState({saving: undefined, message: body.message})
            }
        }).catch(err => {
            console.error(err)
            this.setState({saving: undefined, message: {type: 'danger', text: 'Server error'}})
        })
        this.setState({saving: promise, message: undefined})
    }

    render()
    {
        return (
            <form onSubmit={ev => {ev.preventDefault(); this._handleSubmit()}}>
                {(this.state.message ?
                    <div className={'alert alert-' + this.state.message.type} role='alert'>
                        {this.state.message.text}
                    </div> :
                    <div/>
                )}
                <div className='form-group mb-2'>
                    <label htmlFor='campaign-title'>Name of Your Campaign</label>
                    <input type='text' className='form-control' id='campaign-title' name='title' value={this.state.campaign.title} onChange={ev => this._handleTitleChanged(ev)}/>
                    {this.state.errors.title ? <small className='form-text text-danger'>{this.state.errors.title}</small> : <span/>}
                    <small className='form-text text-muted'>A short and descriptive name for your new campaign.</small>
                </div>
                <div className='form-group mb-2'>
                    <label htmlFor='campaign-slug'>Website Address</label>
                    <div className='input-group'>
                        <div className='input-group-prepend'>
                            <span className='input-group-text'>{this.context.rpc.config.publicURL.protocol}//</span>
                        </div>
                        <input type='text' className='form-control' id='campaign-slug' name='slug' value={this.state.campaign.slug} onChange={ev => this._handleSlugChanged(ev)}/>
                        <div className='input-group-append'>
                            <span className='input-group-text'>.{this.context.rpc.config.publicURL.hostname}</span>
                        </div>
                    </div>
                    {this.state.errors.slug ? <small className='form-text text-danger'>{this.state.errors.slug}</small> : <span/>}
                    <small className='form-text text-muted'>The unique web address your new campaign can be found at. May only contain letters, numbers, and dashes.</small>
                </div>
                <div className='form-group mb-2'>
                    <label htmlFor='campaign-visibility'>Visibility</label>
                    <div className='input-group'>
                        <select id='campaign-visibility' name='visibility' value={this.state.campaign.visibility}  onChange={ev => this._handleVisibilityChanged(ev)}>
                            <option value='Public'>Public</option>
                            <option value='Hidden'>Hidden</option>
                        </select>
                    </div>
                </div>
                <div className='form-group'>
                    <SaveButton saving={!!this.state.saving} disabled={!!this.state.saving} onClick={() => this._handleSubmit()}/>
                </div>
            </form>
        )
    }
}