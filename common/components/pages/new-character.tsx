import * as React from 'react'

import { MarkEditor } from '../mark-editor'
import { ImageSelect } from '../image-select'
import { ImageThumb } from '../image-thumb'
import { SaveButton } from '../save-button'
import { FormInput } from '../form-utils'
import { RawDraft } from '../raw-draft'
import { API, APIError, CharacterData, CharacterInput } from '../../types'
import { RawDraftContentState } from 'draft-js'
import { APIConsumer } from '../api'

interface State
{
    char: CharacterInput
    saving?: Promise<void>
    errors: {[K in keyof(CharacterData)]?: string}
}
export class NewCharacter extends React.Component<{}, State>
{
    state: State = {
        char: {
            title: 'New Character'
        },
        errors: {}
    }

    private _handleSubmitClicked(api: API)
    {
        if (!this.state.saving)
        {
            const saving = api.saveCharacter(this.state.char)
                .then(char => {
                    document.location.href = `/chars/c/${char.slug}`
                }).catch(err => {
                    this.setState({saving: undefined})
                    if (err instanceof APIError && err.errors)
                        this.setState({errors: err.errors})
                })
            this.setState({saving})
        }
    }

    private static _makeSlug(str: string|undefined)
    {
        return str ? str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/ +/g, ' ').trim().replace(/ /g, '-') : undefined
    }

    private _handleChange<P extends keyof(CharacterInput)>(key: P, value: CharacterInput[P])
    {
        this.setState({char: {...this.state.char, [key]: value}})
    }

    private _handleTitleChanged(title: string)
    {
        this.setState({char: {...this.state.char, title}})
    }

    private _handleSlugChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        const slug = ev.target.value
        this.setState({char: {...this.state.char, slug}})
    }

    private _handleVisibilityChanged(ev: React.ChangeEvent<HTMLSelectElement>)
    {
        const visible = ev.target.value == 'visible'
        this.setState({char: {...this.state.char, visible}})
    }

    private _handleBodyChanged(rawbody: RawDraftContentState)
    {
        this.setState({char: {...this.state.char, rawbody}})
    }

    private _handleImageSelected(portrait: File|undefined)
    {
        this.setState({char: {...this.state.char, portrait}})
    }

    public render()
    {
        const current = this.state.char
        return (
            <div>
                <div className='form-row'>
                    <div className='col-md-10'>
                        <div className='form-row'>
                            <FormInput type='text' className='col-md-8' name='title' value={this.state.char.title || ''} disabled={!!this.state.saving} onChange={val => this._handleChange('title', val)} placeholder='First Last'/>
                            <div className='form-group col-md-4'>
                                <select className='form-control' disabled={!!this.state.saving} value={this.state.char.visible?'visible':''} onChange={ev => this._handleVisibilityChanged(ev)}>
                                    <option value='visible'>Party Public</option>
                                    <option value=''>GM Secret</option>
                                </select>
                            </div>
                        </div>
                        <div className='form-row'>
                            <FormInput type='text' className='col-md-12' name='slug' value={this.state.char.slug || ''} disabled={true} onChange={val => this._handleChange('slug', val)} help='Optional. Must be letters and numbers, unique.' prefix={() => <span className='input-group-text'>/chars/c/</span>} placeholder={NewCharacter._makeSlug(this.state.char.title)}/>
                        </div>
                    </div>
                    <ImageSelect size={100} label={false} className='form-group col-md-2' disabled={!!this.state.saving} onImageSelected={file => this._handleImageSelected(file)}/>
                </div>
                <MarkEditor document={this.state.char.rawbody} disabled={!!this.state.saving} onChange={body => this._handleBodyChanged(body)} buttons={() => (
                    <div className='ml-sm-2 float-right'>
                        <APIConsumer render={api => <SaveButton disabled={!!this.state.saving} title='Create' saving={!!this.state.saving} onClick={() => this._handleSubmitClicked(api)}/>}/>
                    </div>
                )}/>
            </div>
        )
    }
}