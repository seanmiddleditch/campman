import * as React from 'react'
import { Prompt } from 'react-router-dom'

import { MarkEditor } from '../draft/editor'
import { ImageSelect } from '../image-select'
import { ImageThumb } from '../image-thumb'
import { ActionButton } from '../action-button'
import { FormInput } from '../form-utils'
import { API, APIError, CharacterData, CharacterInput } from '../../types'
import { RawDraftContentState } from 'draft-js'
import { APIConsumer } from '../api-context'
import { ProfileDropdown } from '../profile-dropdown'

interface Props
{
    initial: CharacterData
}
interface State
{
    char: CharacterInput
    saving?: Promise<void>
    deleting?: Promise<void>
    errorMessage?: string
    errors: {[K in keyof(CharacterData)]?: string}
    dirty: boolean
}
export class EditCharacter extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {
            char: {...this.props.initial},
            errors: {},
            dirty: false
        }
    }

    private _handleSubmitClicked(api: API)
    {
        if (!this.state.saving && !this.state.deleting)
        {
            const saving = api.saveCharacter(this.state.char)
                .then(char => {
                    document.location.href = `/chars/c/${char.slug}`
                }).catch(err => {
                    this.setState({errorMessage: err.message, saving: undefined})
                    if (err instanceof APIError && err.errors)
                        this.setState({errors: err.errors})
                })
            this.setState({saving})
        }
    }

    private _handleDeleteClicked(api: API)
    {
        if (!this.state.saving && !this.state.deleting)
        {
            if (confirm('This deletion will be forever. Click OK to confirm.'))
            {
                const deleting = api.deleteCharacter({characterId: this.props.initial.id})
                    .then(char => {
                        document.location.href = `/chars`
                    }).catch(err => {
                        this.setState({errorMessage: err.message, saving: undefined})
                        if (err instanceof APIError && err.errors)
                            this.setState({errors: err.errors})
                    })
                this.setState({deleting})
            }
        }
    }

    private _handleChange<P extends keyof(CharacterInput)>(key: P, value: CharacterInput[P])
    {
        this.setState({char: {...this.state.char, [key]: value}, dirty: true})
    }

    public render()
    {
        const current = this.state.char
        return (
            <>
                <Prompt when={this.state.dirty} message='You have unsaved changes. Are you sure you want to leave?'/>
                {this.state.errorMessage && <div className='alert alert-danger'>{this.state.errorMessage}</div>}
                <div className='form-row'>
                    <div className='col-md-10'>
                        <div className='form-row'>
                            <FormInput type='text' className='col-md-8' name='title' value={this.state.char.title || ''} disabled={!!this.state.saving} onChange={val => this._handleChange('title', val)} placeholder='First Last'/>
                            <div className='form-group col-md-4'>
                                <select className='form-control' disabled={!!this.state.saving} value={this.state.char.visible?'visible':''} onChange={ev => this._handleChange('visible', ev.target.value === 'visible')}>
                                    <option value='visible'>Party Public</option>
                                    <option value=''>GM Secret</option>
                                </select>
                            </div>
                        </div>
                        <div className='form-row'>
                            <FormInput type='text' className='col-md-12' name='slug' value={this.state.char.slug || ''} disabled={true} prefix={() => <span className='input-group-text'>/chars/c/</span>}/>
                        </div>
                        <div className='form-row'>
                            <ProfileDropdown className='col-md-12' disabled={!!this.state.saving} value={this.state.char.owner} onChange={val => this._handleChange('owner', val)}/>
                        </div>
                    </div>
                    <ImageSelect size={100} label={false} className='form-group col-md-2'
                        disabled={!!this.state.saving} onImageSelected={file => this._handleChange('portrait', file)}
                        fallback={() => this.props.initial.portrait && <ImageThumb hash={this.props.initial.portrait.contentMD5} size={100}/>}
                    />
                </div>
                <MarkEditor document={this.state.char.rawbody} disabled={!!this.state.saving} onChange={body => this._handleChange('rawbody', body)} buttons={() => (
                    <div className='ml-sm-2 float-right'>
                        <APIConsumer render={api => 
                            <ActionButton
                                disabled={!!this.state.saving || !!this.state.deleting}
                                defaultAction='save'
                                busy={this.state.saving ? 'Saving...' : this.state.deleting ? 'Deleting...' : undefined}
                                actions={{
                                    save: {label: 'Save Changes', icon: 'floppy-o', onClick: () => this._handleSubmitClicked(api)},
                                    delete: {label: 'Delete Character', icon: 'trash-o', color: 'danger', onClick: () => this._handleDeleteClicked(api)}
                                }}
                            />
                        }/>
                    </div>
                )}/>
            </>
        )
    }
}