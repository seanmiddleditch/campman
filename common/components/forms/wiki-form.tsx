import * as React from 'react'
import {MarkEditor} from '../mark-editor'
import {API, APIError} from '../../types'
import {WikiPageInput, WikiPageData} from '../../types/content'
import {SaveButton} from '../save-button'
import {APIConsumer} from '../api'

interface Props
{
    initial: WikiPageInput
    onSubmit: (data: WikiPageData) => void
}
interface State
{
    data: WikiPageInput
    saving?: Promise<void>
    visDropDownOpen: boolean
}
export class WikiForm extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {
            data: {...this.props.initial},
            visDropDownOpen: false
        }
    }

    private static _makeSlug(str: string)
    {
        return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/ +/g, ' ').trim().replace(/ /g, '-')
    }

    private _handleTitleChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        ev.preventDefault()
        const title = ev.target.value
        this.setState(s => ({data: {...s.data, title}}))
    }

    private _handleTagsChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        ev.preventDefault()
        const tags = ev.target.value
        this.setState(s => ({data: {...s.data, tags}}))
    }

    private _handleSlugChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        ev.preventDefault()
        if (!this.props.initial.slug) // can't change slug on existing pages
        {
            const slug = ev.target.value
            this.setState(s => ({data: {...s.data, slug}}))
        }
    }

    private _handleBodyChanged(rawbody: any)
    {
        this.setState(s => ({data: {...s.data, rawbody}}))
    }

    private _handleSubmitClicked(api: API)
    {
        if (!this.state.saving)
        {
            const saving = api.saveWikiPage(this.state.data)
                .then(page => this.props.onSubmit(page))
                .catch(err => {
                    this.setState({saving: undefined})
                })
            this.setState({saving})
        }
    }

    private _handleSubmitDropdownClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        ev.preventDefault()
        this.setState({visDropDownOpen: !this.state.visDropDownOpen})
    }

    private _handleVisibilityClicked(ev: React.MouseEvent<HTMLAnchorElement>, visibility: 'Public'|'Hidden')
    {
        ev.preventDefault()
        this.setState(s => ({data: {...s.data, visibility}, visDropDownOpen: false}))
    }

    private _editorButtons()
    {
        return (
            <div className='ml-sm-2 float-right'>
                <div className='btn-group mr-2' role='group'>
                    <button className='btn btn-secondary dropdown-toggle' onClick={ev => this._handleSubmitDropdownClicked(ev)}>{this.state.data.visibility}</button>
                    <div className={'dropdown-menu ' + (this.state.visDropDownOpen ? 'show' : '')}>
                        <a className={'dropdown-item ' + (this.state.data.visibility == 'Public' ? 'active' : '')} onClick={ev  => this._handleVisibilityClicked(ev, 'Public')}>Party Public</a>
                        <a className={'dropdown-item ' + (this.state.data.visibility == 'Hidden' ? 'active' : '')} onClick={ev  => this._handleVisibilityClicked(ev, 'Hidden')}>GM Secret</a>
                    </div>
                </div>
                <APIConsumer render={api => <SaveButton disabled={!!this.state.saving} saving={!!this.state.saving} onClick={() => this._handleSubmitClicked(api)}/>}/>
            </div>
        )
    }

    public render()
    {
        return (
            <form id='page-form' method='post' action='/wiki'>
                <div className='form-group mb-2'>
                    <div className='input-group'>
                        <input type='text' className='form-control' value={this.state.data.title} placeholder='Page Title' onChange={ev => this._handleTitleChanged(ev)}/>
                    </div>
                </div>
                <div className='form-group mb-2'>
                    <div className='input-group'>
                        <div className='input-group-prepend'>
                            <span className='input-group-text'><i className='fa fa-tag'></i></span>
                        </div>
                        <input type='text' className='form-control' value={this.state.data.tags} placeholder='Comma-separated tags'  onChange={ev => this._handleTagsChanged(ev)}/>
                    </div>
                </div>
                {this.props.initial.slug && (
                    <div className='form-group mb-2'>
                        <div className='input-group'>
                            <div className='input-group-prepend'>
                                <span className='input-group-text'>/wiki/p/</span>
                            </div>
                            <input type='text' className='form-control' value={this.state.data.slug} placeholder={WikiForm._makeSlug(this.state.data.title || '')} onChange={ev => this._handleSlugChanged(ev)}/>
                        </div>
                        <small className='form-text text-muted'>May only contain letters, numbers, and dashes.</small>
                    </div>
                )}
                <div className='form-group mb-2'>
                    <MarkEditor document={this.state.data.rawbody} onChange={ev => this._handleBodyChanged(ev)} buttons={() => this._editorButtons()}/>
                </div>
            </form>
        )
    }
}