import * as React from 'react'

import { MarkEditor } from '../mark-editor'
import { ImageSelect } from '../image-select'
import { ImageThumb } from '../image-thumb'
import { SaveButton } from '../save-button'
import { FormInput } from '../form-utils'
import { RawDraft } from '../raw-draft'
import { API, APIError, AdventureData, AdventureInput } from '../../types'
import { RawDraftContentState } from 'draft-js'
import { StateConsumer } from '../state-context'
import { APIConsumer } from '../api-context'
import { ProfileDropdown } from '../profile-dropdown'

interface Props
{
    initial: AdventureData
}
interface State
{
    adventure: AdventureInput
    saving?: Promise<void>
    errors: {[K in keyof(AdventureInput)]?: string}
}
export class EditAdventure extends React.Component<{}, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {
            adventure: {...props.initial},
            errors: {}
        }
    }

    private _handleSubmitClicked(campaignId: number, api: API)
    {
        if (!this.state.saving)
        {
            const saving = api.createAdventure({campaignId, adventure: this.state.adventure})
                .then(adv => {
                    document.location.href = `/adventures/${adv.id}`
                }).catch(err => {
                    this.setState({saving: undefined})
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
        return (
            <div>
                <FormInput type='text' title='Short Description' name='title' value={adventure.title || ''} disabled={!!this.state.saving} onChange={val => this._handleChange('title', val)}/>
                <div className='form-group'>
                    <select className='form-control' disabled={!!this.state.saving} value={adventure.visible?'visible':''} onChange={ev => this._handleChange('visible', ev.target.value === 'visible')}>
                        <option value='visible'>Party Public</option>
                        <option value=''>GM Secret</option>
                    </select>
                </div>
                <MarkEditor document={adventure.rawbody} disabled={!!this.state.saving} onChange={doc => this._handleChange('rawbody', doc)} buttons={() => (
                    <div className='ml-sm-2 float-right'>
                        <StateConsumer render={state => <APIConsumer render={api => <SaveButton disabled={!!this.state.saving} title='Save' saving={!!this.state.saving} onClick={() => this._handleSubmitClicked(state.config.campaign ? state.config.campaign.id : 0, api)}/>}/>}/>
                    </div>
                )}/>
            </div>
        )
    }
}