import * as React from 'react'
import {MarkEditor} from './mark-editor'
import {SaveButton} from './save-button'
import {Content} from '../rpc'

interface WikiPageEditorProps
{
    title: string
    tags: string
    slug?: string
    body: {}|null
    visibility: string
    rpc: Content
}
interface WikiPageEditorState
{
    title: string
    tags: string
    slug: string
    document: any
    visibility: 'Public'|'Hidden'
    visDropDownOpen: boolean
    saving?: Promise<void>
}
export class WikiPageEditor extends React.Component<WikiPageEditorProps, WikiPageEditorState>
{
    constructor(props: WikiPageEditorProps)
    {
        super(props)
        this.state = {
            title: props.title,
            tags: props.tags,
            slug: props.slug || WikiPageEditor._makeSlug(props.title),
            document: props.body,
            visibility: props.visibility === 'Public' ? 'Public' : 'Hidden',
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
        this.setState({title: ev.target.value})
    }

    private _handleTagsChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        ev.preventDefault()
        this.setState({tags: ev.target.value})
    }

    private _handleSlugChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        ev.preventDefault()
        if (!this.props.slug) // can't change slug on existing pages
            this.setState({slug: ev.target.value})
    }

    private _handleBodyChanged(document: any)
    {
        this.setState({document})
    }

    private _handleSubmitClicked()
    {
        if (!this.state.saving)
        {
            const saving = fetch('/wiki', {
                method: 'POST',
                mode: 'same-origin',
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }),
                body: JSON.stringify({
                    slug: this.state.slug,
                    title: this.state.title,
                    labels: this.state.tags,
                    visibility: this.state.visibility,
                    rawbody: this.state.document
                })
            }).then(async (response) => {
                if (!response.ok)
                    throw new Error(response.statusText)
                else if (response.status !== 200)
                    throw new Error(response.statusText)

                const body = await response.json()
                if (body.status !== 'success')
                    throw new Error(body.message)
                else
                    document.location.href = body.data.location
                this.setState({saving: undefined})
            }).catch(err => {
                alert(err)
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
        this.setState({visibility, visDropDownOpen: false})
    }

    private _editorButtons()
    {
        return (
            <div className='ml-sm-2 float-right'>
                <div className='btn-group mr-2' role='group'>
                    <button className='btn btn-secondary dropdown-toggle' onClick={ev => this._handleSubmitDropdownClicked(ev)}>{this.state.visibility}</button>
                    <div className={'dropdown-menu ' + (this.state.visDropDownOpen ? 'show' : '')}>
                        <a className={'dropdown-item ' + (this.state.visibility == 'Public' ? 'active' : '')} onClick={ev  => this._handleVisibilityClicked(ev, 'Public')}>Party Public</a>
                        <a className={'dropdown-item ' + (this.state.visibility == 'Hidden' ? 'active' : '')} onClick={ev  => this._handleVisibilityClicked(ev, 'Hidden')}>GM Secret</a>
                    </div>
                </div>
                <SaveButton disabled={!!this.state.saving} saving={!!this.state.saving} onClick={() => this._handleSubmitClicked()}/>
            </div>
        )
    }

    render()
    {
        return (
            <form id='page-form' method='post' action='/wiki'>
                <div className='form-group mb-2'>
                    <div className='input-group'>
                        <input type='text' className='form-control' value={this.state.title} placeholder='Page Title' onChange={ev => this._handleTitleChanged(ev)}/>
                    </div>
                </div>
                <div className='form-group mb-2'>
                    <div className='input-group'>
                        <div className='input-group-prepend'>
                            <span className='input-group-text'><i className='fa fa-tag'></i></span>
                        </div>
                        <input type='text' className='form-control' name='labels' value={this.state.tags} placeholder='Comma-separated labels'  onChange={ev => this._handleTagsChanged(ev)}/>
                    </div>
                </div>
                {this.props.slug ? null : (
                <div className='form-group mb-2'>
                    <div className='input-group'>
                        <div className='input-group-prepend'>
                            <span className='input-group-text'>/wiki/p/</span>
                        </div>
                        <input type='text' className='form-control' placeholder={WikiPageEditor._makeSlug(this.state.title)} onChange={ev => this._handleSlugChanged(ev)}/>
                    </div>
                    <small className='form-text text-muted'>May only contain letters, numbers, and dashes.</small>
                </div>)}
                <div className='form-group mb-2'>
                    <MarkEditor document={this.state.document} rpc={this.props.rpc.media} onChange={ev => this._handleBodyChanged(ev)} buttons={() => this._editorButtons()}/>
                </div>
            </form>
        )
    }
}
