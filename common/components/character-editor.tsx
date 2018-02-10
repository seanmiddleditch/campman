import * as React from 'react'
import {ImageSelect} from './image-select'
import {MarkEditor} from './mark-editor'
import {ImageThumb} from './image-thumb'
import {CharacterData} from '../types'
import {MediaContent} from '../rpc/media-content'

interface Props
{
    onChange: (char: CharacterData) => void
    data?: CharacterData
    disabled?: boolean
    buttons?: () => any
    rpc: MediaContent
}
export class CharacterEditor extends React.PureComponent<Props>
{
    private static _makeSlug(str: string)
    {
        return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/ +/g, ' ').trim().replace(/ /g, '-')
    }

    private _handleTitleChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        ev.preventDefault()
        const title = ev.target.value
        this.props.onChange({...this.props.data, title})
    }

    private _handleSlugChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        ev.preventDefault()
        const slug = ev.target.value
        this.props.onChange({...this.props.data, slug})
    }

    private _handleVisibilityChanged(ev: React.ChangeEvent<HTMLSelectElement>)
    {
        ev.preventDefault()
        const visible = ev.target.value == 'visible'
        this.props.onChange({...this.props.data, visible})
    }

    private _handleBodyChanged(body: any)
    {
        this.props.onChange({...this.props.data, body})
    }

    private _handleImageSelected(portrait: File)
    {
        this.props.onChange({...this.props.data, portrait})
    }

    private _fallbackURL()
    {
        if (this.props.data && this.props.data.portrait && !(this.props.data.portrait instanceof File))
        {
            return <ImageThumb hash={this.props.data.portrait.hash} size={100}/>
        }
        else
        {
            return undefined
        }
    }

    render()
    {
        return (
            <form>
                <div className='form-row'>
                    <div className='col-md-10'>
                        <div className='form-row'>
                            <div className='form-group col-md-8'>
                                <input type='text' className='form-control' value={this.props.data.title} disabled={this.props.disabled} onChange={ev => this._handleTitleChanged(ev)} placeholder='First Last'/>
                            </div>
                            <div className='form-group col-md-4'>
                                <select className='form-control' value={this.props.data.visible?'visible':''} onChange={ev => this._handleVisibilityChanged(ev)}>
                                    <option value='visible'>Party Public</option>
                                    <option value=''>GM Secret</option>
                                </select>
                            </div>
                        </div>
                        <div className='form-row'>
                            <div className='form-group col-md-12'>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>/chars/c/</span>
                                    </div>
                                    <input ref='slug' type='text' disabled={this.props.disabled} className='form-control' onChange={ev => this._handleSlugChanged(ev)} placeholder={CharacterEditor._makeSlug(this.props.data.title)}/>
                                </div>
                                <div className='form-text text-muted'>Optional. Must be letters and numbers, unique.</div>
                            </div>
                        </div>
                    </div>
                    <ImageSelect size={100} label={false} className='form-group col-md-2' disabled={this.props.disabled} onImageSelected={file => this._handleImageSelected(file)} fallback={() => this._fallbackURL()}/>
                </div>
                <MarkEditor document={this.props.data.body} rpc={this.props.rpc} disabled={this.props.disabled} buttons={this.props.buttons} onChange={body => this._handleBodyChanged(body)}/>
            </form>
        )
    }
}