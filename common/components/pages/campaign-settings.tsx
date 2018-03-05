import * as React from 'react'
import {SaveButton} from '../save-button'
import {API, APIError} from '../../types'
import {StateConsumer} from '../state'
import {APIConsumer} from '../api'

interface Campaign
{
    title: string
    slug: string
    visibility: 'Public'|'Hidden'
    url: string
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
    constructor(props: Props)
    {
        super(props)
        this.state = {
            errors: {},
            campaign: {
                title: props.campaign.title,
                slug: props.campaign.slug,
                visibility: props.campaign.visibility,
                url: 'ignored'
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

    private _handleSubmit(api: API)
    {
        const promise = api.saveSettings(this.state.campaign)
        promise.then(() => {
            this.setState({saving: promise, message: {type: 'success', text: 'Settings saved'}})
        }).catch(err => {
            this.setState({message: {type: 'danger', text: err.message}, saving: undefined})
            if (err instanceof APIError && err.errors)
                this.setState({errors: {
                    title: err.errors.title,
                    slug: err.errors.slug
                }})
        })
        this.setState({saving: promise, message: undefined})
    }

    render()
    {
        return <APIConsumer render={api => <StateConsumer render={state => (
            <div>
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
                            <span className='input-group-text'>{state.config.publicURL.protocol}//</span>
                        </div>
                        <input type='text' className='form-control' id='campaign-slug' name='slug' value={this.state.campaign.slug} onChange={ev => this._handleSlugChanged(ev)}/>
                        <div className='input-group-append'>
                            <span className='input-group-text'>.{state.config.publicURL.hostname}</span>
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
                    <SaveButton saving={!!this.state.saving} disabled={!!this.state.saving} onClick={() => this._handleSubmit(api)}/>
                </div>
            </div>
        )}/>}/>
    }
}