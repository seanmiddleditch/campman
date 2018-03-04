import * as React from 'react'

import {ImageSelect} from '../image-select'
import {SaveButton} from '../save-button'
import {FormInput} from '../form-utils'

interface Props {}
interface State
{
    file?: File
    title: string
    slug: string
    saving?: Promise<void>
    errors: {
        message?: string
        title?: string
        slug?: string
        file?: string
    }
}
export class NewMap extends React.Component<Props, State>
{
    state: State = {
        title: 'New Map',
        slug: '',
        errors: {}
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

    private _handleSlugChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        ev.preventDefault()
        this.setState({slug: ev.target.value})
    }

    private _handleSubmitClicked()
    {
        if (!this.state.saving)
        {
            const data = new FormData()
            data.append('slug', this.state.slug)
            data.append('title', this.state.title)
            //data.append('visibility', this.state.visibility)
            if (this.state.file) data.append('file', this.state.file)
            const saving = fetch('/maps', {
                method: 'POST',
                mode: 'same-origin',
                credentials: 'include',
                body: data
            }).then(async (response) => {
                const body = await response.json()
                if (body.status === 'success')
                {
                    document.location.href = '/maps'
                }
                else
                {
                    this.setState({errors: {message: body.message, ...body.fields}, saving: undefined})
                }
            }).catch(err => {
                console.error(err)
                this.setState({saving: undefined, errors: {message: `${err}`}})
            })
            this.setState({saving})
        }
    }

    private _handleVisibilityClicked(ev: React.MouseEvent<HTMLAnchorElement>, visibility: 'Public'|'Hidden')
    {
        ev.preventDefault()
        // this.setState({visibility, visDropDownOpen: false})
    }

    private _handleImageSelected(file: File|undefined)
    {
        this.setState({file})
    }

    render()
    {
        return (<div>
            <h1>New Map</h1>
            <FormInput type='text' title='Map Title' name='title' error={this.state.errors.title} onChange={title => this.setState({title})}/>
            <FormInput type='text' title='Slug' name='slug' help='Letters, numbers, and dashes only. Must be between 3 and 32 characters.' placeholder={NewMap._makeSlug(this.state.title)} error={this.state.errors.slug} prefix={() => <span className='input-group-text'>/maps/m/</span>} onChange={slug => this.setState({slug})}/>
            <div className='form-group'>
                <ImageSelect onImageSelected={file => this._handleImageSelected(file)}/>
                {this.state.errors.file && <div className='text-danger'>{this.state.errors.file}</div>}
            </div>
            <SaveButton icon='plus' title='Upload New Map' working='Creating' saving={!!this.state.saving} onClick={() => this._handleSubmitClicked()}/>
        </div>)
    }
}
