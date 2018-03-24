import * as React from 'react'
import { API, APIError } from '../../types'
import { URL } from 'url'
import { SaveButton } from '../save-button'
import { StateConsumer } from '../state-context'
import { APIConsumer } from '../api-context'
import { WithConfig } from '../containers/with-config'
import parse = require('url-parse')

interface State
{
    title: string
    slug: string
    message?: string
    errors: {
        title?: string
        slug?: string
    }
    promise?: Promise<void>
}
export class NewCampaign extends React.Component<{}, State>
{
    state: State = {
        title: 'New Campaign',
        slug: 'new-campaign',
        errors: {}
    }

    private _handleSubmit(api: API)
    {
        const data = {
            title: this.state.title,
            slug: this.state.slug,
            visibility: 'Public' as 'Public'|'Hidden'
        }
        const promise = api.createCampaign(data).then(camp => {
            document.location.href = '/campaigns'
        }).catch(err => {
            this.setState({promise: undefined, message: err.message})
            if (err instanceof APIError && err.errors)
                this.setState({errors: {
                    title: err.errors.title,
                    slug: err.errors.slug,
                }})
        })
        this.setState({promise})
    }

    public render()
    {
        const errors = this.state.errors

        return (
            <WithConfig>
                {config => <>
                    {this.state.message && <div className='alert alert-danger'>{this.state.message}</div>}
                    <div className='form-group mb-2'>
                        <label>Name of Your Campaign</label>
                        <input type='text' className={`form-control is-${errors.title && 'in'}valid`} id='campaign-title' name='title' value={this.state.title} onChange={ev => this.setState({title: ev.target.value})} placeholder='My Campaign'/>
                        {errors.title && <small className='invalid-feedback'>{errors.title}</small>}
                        <small className='form-text text-muted'>A short and descriptive name for your new campaign.</small>
                    </div>
                    <div className='form-group mb-2'>
                        <label>Website Address</label>
                        <div className='input-group'>
                            <div className='input-group-prepend'>
                                <span className='input-group-text'>{parse(config.publicURL).protocol}//</span>
                            </div>
                            <input type='text' className={`form-control is-${errors.slug && 'in'}valid`} id='campaign-slug' name='slug' value={this.state.slug} onChange={ev => this.setState({slug: ev.target.value})} placeholder={this.state.title}/>
                            <div className='input-group-append'>
                                <span className='input-group-text'>.{parse(config.publicURL).host}</span>
                            </div>
                        </div>
                        {errors.slug && <small className='invalid-feedback'>{errors.slug}</small>}
                        <small className='form-text text-muted'>The unique web address your new campaign can be found at. May only contain letters, numbers, and dashes.</small>
                    </div>
                    <div className='form-group'>
                        <APIConsumer render={api => 
                            <SaveButton saving={!!this.state.promise} title='Get Started' onClick={() => this._handleSubmit(api)}/>
                        }/>
                    </div>
                </>}
            </WithConfig>
        )
    }
}