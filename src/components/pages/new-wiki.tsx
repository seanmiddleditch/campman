import * as React from 'react'
import { MarkEditor } from '../mark-editor'
import { SaveButton } from '../save-button'
import { WikiPageInput, WikiPageData } from '../../types/content'
import { API, APIError } from '../../types/api'
import { RawDraftContentState } from 'draft-js'
import { APIConsumer } from '../api-context'
import { FormInput, DropButton } from '../form-utils'

interface State
{
    page: WikiPageInput
    message?: {
        type: 'danger'|'info',
        text: string
    }
    errors?: {[P in keyof(WikiPageInput)]?: string}
    saving?: Promise<void>
}
export class NewWiki extends React.Component<{}, State>
{
    state: State = {
        page: {}
    }

    private static _makeSlug(str: string)
    {
        return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/ +/g, ' ').trim().replace(/ /g, '-')
    }

    private _handleSubmitClicked(api: API)
    {
        if (!this.state.saving)
        {
            const saving = api.saveWikiPage(this.state.page)
                .then(page => {
                    this.setState({saving: undefined, message: {type: 'info', text: `Changes saved at ${new Date().toLocaleTimeString()}.`}})
                })
                .catch(err => {
                    this.setState({saving: undefined, message: {type: 'danger', text: err.message}})
                    if (err instanceof APIError && err.errors)
                        this.setState({errors: err.errors})
                })
            this.setState({saving})
        }
    }

    private _handleChange<P extends keyof(WikiPageInput)>(key: P, value: WikiPageInput[P])
    {
        this.setState({page: {...this.state.page, [key]: value}})
    }

    render()
    {
        return (<div>
            {this.state.message && <div className={`alert alert-${this.state.message.type}`}>{this.state.message.text}</div>}
            <div className='form-group mb-2'>
                <div className='input-group'>
                    <input type='text' className='form-control' value={this.state.page.title} placeholder='Page Title' onChange={ev => this._handleChange('title', ev.target.value)}/>
                </div>
            </div>
            <div className='form-group mb-2'>
                <div className='input-group'>
                    <div className='input-group-prepend'>
                        <span className='input-group-text'><i className='fa fa-tag'></i></span>
                    </div>
                    <input type='text' className='form-control' value={this.state.page.tags} placeholder='Comma-separated tags' onChange={ev => this._handleChange('tags', ev.target.value)}/>
                </div>
            </div>
            <div className='form-group mb-2'>
                <div className='input-group'>
                    <div className='input-group-prepend'>
                        <span className='input-group-text'>/wiki/p/</span>
                    </div>
                    <input type='text' className='form-control' value={this.state.page.slug} placeholder={NewWiki._makeSlug(this.state.page.title || '')} onChange={ev => this._handleChange('slug', ev.target.value)}/>
                </div>
                <small className='form-text text-muted'>May only contain letters, numbers, and dashes.</small>
            </div>
            <div className='form-group mb-2'>
                <MarkEditor document={this.state.page.rawbody} onChange={doc => this._handleChange('rawbody', doc)} buttons={() => (
                    <div className='ml-sm-2 float-right'>
                        <DropButton className='btn-group mr-2' display={this.state.page.visibility || 'Hidden'}>
                            <a className={'dropdown-item ' + (this.state.page.visibility == 'Public' ? 'active' : '')} onClick={() => this._handleChange('visibility', 'Public')}>Party Public</a>
                            <a className={'dropdown-item ' + (this.state.page.visibility == 'Hidden' ? 'active' : '')} onClick={() => this._handleChange('visibility', 'Hidden')}>GM Secret</a>
                        </DropButton>
                        <APIConsumer render={api => <SaveButton disabled={!!this.state.saving} saving={!!this.state.saving} onClick={() => this._handleSubmitClicked(api)}/>}/>
                    </div>
                )}/>
            </div>
        </div>)
    }
}
