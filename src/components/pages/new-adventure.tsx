import * as React from 'react'

import { MarkEditor } from '../draft/editor'
import { ImageSelect } from '../image-select'
import { ImageThumb } from '../image-thumb'
import { SaveButton } from '../save-button'
import { FormInput, FormSelect } from '../form-utils'
import { API, APIError, AdventureData, AdventureInput } from '../../types'
import { RawDraftContentState } from 'draft-js'
import { StateConsumer } from '../state-context'
import { APIConsumer } from '../api-context'
import { Alert } from '../alert'
import { CurrentCampaign } from '../containers/current-campaign'

interface State
{
    adventure: AdventureInput
    saving?: Promise<void>
    errors: {[K in keyof(AdventureInput)]?: string}
    errorMessage?: string
}
export class NewAdventure extends React.Component<{}, State>
{
    state: State = {
        adventure: {
            title: ''
        },
        errors: {}
    }

    private _handleSubmitClicked(campaignId: number, api: API)
    {
        if (!this.state.saving)
        {
            const saving = api.createAdventure({campaignId, adventure: this.state.adventure})
                .then(adv => {
                    document.location.href = `/adventures/${adv.id}`
                }).catch(err => {
                    this.setState({saving: undefined, errorMessage: err.message})
                    if (err instanceof APIError && err.errors)
                        this.setState({errors: err.errors})
                })
            this.setState({saving})
        }
    }

    private _handleChange<P extends keyof(AdventureInput)>(key: P, value: AdventureInput[P])
    {
        this.setState({adventure: {...this.state.adventure, [key]: value}})
    }

    public render()
    {
        const adventure = this.state.adventure
        const errors = this.state.errors
        return (
            <div>
                {this.state.errorMessage && <Alert type='danger'>{this.state.errorMessage}</Alert>}
                <FormInput type='text' title='Short Description' error={errors.title} name='title' value={adventure.title || ''} disabled={!!this.state.saving} onChange={val => this._handleChange('title', val)}/>
                <FormSelect name='visible' title='Public' error={errors.visible} options={[{value: 'visible', label: 'Public'}, {value: '', label: 'Secret'}]} value={adventure.visible ? 'visible' : ''} defaultValue='visible'/>
                <MarkEditor document={adventure.rawbody} disabled={!!this.state.saving} onChange={doc => this._handleChange('rawbody', doc)} buttons={() => (
                    <div className='ml-sm-2 float-right'>
                        <CurrentCampaign>
                            {campaign =>
                                <APIConsumer render={api =>
                                    <SaveButton disabled={!!this.state.saving} title='Create' saving={!!this.state.saving} onClick={() => this._handleSubmitClicked(campaign ? campaign.id : 0, api)}/>
                                }/>
                            }
                        </CurrentCampaign>
                    </div>
                )}/>
            </div>
        )
    }
}