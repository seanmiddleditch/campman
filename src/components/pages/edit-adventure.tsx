import * as React from 'react'
import { Prompt } from 'react-router-dom'

import { MarkEditor } from '../draft/editor'
import { ImageSelect } from '../image-select'
import { ImageThumb } from '../image-thumb'
import { FormInput, FormSelect } from '../form-utils'
import { RenderRaw } from '../draft/render-raw'
import { API, APIError, AdventureData, AdventureInput } from '../../types'
import { RawDraftContentState } from 'draft-js'
import { StateConsumer } from '../state-context'
import { APIConsumer } from '../api-context'
import { Alert } from '../alert'
import { ActionButton } from '../action-button'
import { AdventureContainer } from '../containers/adventure'
import { NotFound } from './not-found'

interface Props
{
    initial: AdventureData
}
interface State
{
    adventure: AdventureInput
    saving?: Promise<void>
    deleting?: Promise<void>
    errorMessage?: string
    errors: {[K in keyof(AdventureInput)]?: string}
    dirty: boolean
}
class Editor extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {
            adventure: {...props.initial},
            errors: {},
            dirty: false
        }
    }

    private _handleSubmitClicked(campaignId: number, api: API)
    {
        if (!this.state.saving && !this.state.deleting)
        {
            const saving = api.updateAdventure({campaignId, adventure: this.state.adventure})
                .then(adv => {
                    document.location.href = `/adventures/${adv.id}`
                })
                .catch(err => {
                    this.setState({saving: undefined, errorMessage: err.message})
                    if (err instanceof APIError && err.errors)
                        this.setState({errors: err.errors})
                })
            this.setState({saving})
        }
    }

    private _handleDeleteClicked(campaignId: number, api: API)
    {
        if (!this.state.saving && !this.state.deleting)
        {
            if (confirm('This deletion will be forever. Click OK to confirm.'))
            {
                const deleting = api.deleteAdventure({campaignId, adventureId: this.props.initial.id})
                    .then(() => {
                        document.location.href = '/adventures'
                    })
                    .catch(err => {
                        this.setState({deleting: undefined, errorMessage: err.message})
                        if (err instanceof APIError && err.errors)
                            this.setState({errors: err.errors})
                    })
                this.setState({deleting})
            }
        }
    }

    private _handleChange<P extends keyof(AdventureInput)>(key: P, value: AdventureInput[P])
    {
        this.setState({adventure: {...this.state.adventure, [key]: value}, dirty: true})
    }

    public render()
    {
        const adventure = this.state.adventure
        const errors = this.state.errors
        return (
            <>
                <Prompt when={this.state.dirty} message='You have unsaved changes. Are you sure you want to leave?'/>
                {this.state.errorMessage && <Alert type='danger'>{this.state.errorMessage}</Alert>}
                <FormInput type='text' title='Short Description' error={errors.title} name='title' value={adventure.title || ''} disabled={!!this.state.saving} onChange={val => this._handleChange('title', val)}/>
                <FormSelect name='visible' title='Public' error={errors.visible} options={[{value: 'visible', label: 'Public'}, {value: '', label: 'Secret'}]} value={adventure.visible ? 'visible' : ''} defaultValue='visible'/>
                <MarkEditor document={adventure.rawbody} disabled={!!this.state.saving} onChange={doc => this._handleChange('rawbody', doc)} buttons={() => (
                    <div className='ml-sm-2 float-right'>
                        <StateConsumer render={state => <APIConsumer render={api => (
                            <ActionButton
                                defaultAction='save'
                                disabled={!!this.state.saving}
                                busy={this.state.saving ? 'Saving...' : this.state.deleting ? 'Deleting...' : undefined}
                                actions={{
                                    save: {label: 'Save Changes', icon: 'floppy-o', onClick: () => this._handleSubmitClicked(state.campaign ? state.campaign.id : 0, api)},
                                    delete: {label: 'Delete Adventure', color: 'danger', icon: 'trash-o', onClick: () => this._handleDeleteClicked(state.campaign ? state.campaign.id : 0, api)}
                                }}
                            />
                        )}/>}/>
                    </div>
                )}/>
            </>
        )
    }
}

export const EditAdventure: React.SFC<{id: number}> = ({id}) =>
    <AdventureContainer id={id}>{
        ({adventure}) => adventure ?
            <Editor initial={adventure}/> :
            <NotFound/>
    }</AdventureContainer>