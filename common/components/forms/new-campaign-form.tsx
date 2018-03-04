import * as React from 'react'
import {API} from '../../types'
import {URL} from 'url'
import {SaveButton} from '../save-button'
import {StateConsumer} from '../state'
import {APIConsumer} from '../api'

interface Props
{

}
interface State
{
    title: string
    slug: string
    errors: {
        message?: string
        title?: string
        slug?: string
    }
    promise?: Promise<void>
}
export class NewCampaignForm extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {
            title: 'New Campaign',
            slug: 'new-campaign',
            errors: {}
        }
    }

    private _handleSubmit(api: API)
    {
        const promise = fetch('/campaigns', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({
                title: this.state.title,
                slug: this.state.slug
            })
        }).then(async (response) => {
            const result = await response.json()
            if (result.status === 'success')
            {
                this.setState({promise: undefined})
                document.location.href = result.body.url
            }
            else
            {
                this.setState({...this.state, promise: undefined, errors: {
                    message: result.message,
                    title: 'title' in result.fields ? result.fields['title'] : undefined,
                    slug: 'slug' in result.fields ? result.fields['slug'] : undefined
                }})
            }
        }).catch(err => {
            console.error(err)
            this.setState({promise: undefined})
            alert(err)
        })
        this.setState({promise})
    }

    public render()
    {
        const fields = {
            title: '',
            slug: ''
        }
        const errors = this.state.errors

        return (
            <APIConsumer render={api => <StateConsumer render={state => <div>
                {errors.message && <div className='alert alert-danger'>{errors.message}</div>}
                <label className='form-group mb-2'>
                    <span>Name of Your Campaign</span>
                    <input type='text' className={`form-control is-${errors.title && 'in'}valid`} id='campaign-title' name='title' value={this.state.title} onChange={ev => this.setState({title: ev.target.value})} placeholder='My Campaign'/>
                    {errors.title && <small className='invalid-feedback'>{errors.title}</small>}
                    <small className='form-text text-muted'>A short and descriptive name for your new campaign.</small>
                </label>
                <label className='form-group mb-2'>
                    <span>Website Address</span>
                    <div className='input-group'>
                        <div className='input-group-prepend'>
                            <span className='input-group-text'>{state.config.publicURL.protocol}//</span>
                        </div>
                        <input type='text' className={`form-control is-${errors.slug && 'in'}valid`} id='campaign-slug' name='slug' value={this.state.slug} onChange={ev => this.setState({slug: ev.target.value})} placeholder={this.state.title}/>
                        <div className='input-group-append'>
                            <span className='input-group-text'>.{state.config.publicURL.hostname}</span>
                        </div>
                    </div>
                    {errors.slug && <small className='invalid-feedback'>{errors.slug}</small>}
                    <small className='form-text text-muted'>The unique web address your new campaign can be found at. May only contain letters, numbers, and dashes.</small>
                </label>
                <div className='form-group'>
                    <SaveButton saving={!!this.state.promise} title='Get Started' onClick={() => this._handleSubmit(api)}/>
                </div>
            </div>}/>}/>
        )
    }
}