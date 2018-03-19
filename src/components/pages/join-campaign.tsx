import * as React from 'react'
import { StateConsumer } from '../state-context'

export const JoinCampaign: React.SFC = () =>
    <StateConsumer render={state => 
        state.join && state.join.success ?
            <div className='alert alert-primary'>
                You have successfully joined the campaign!
            </div> :
            <div className='alert alert-danger'>
                {(state.join && state.join.error) || 'We\'re sorry, but your join request is invalid or cannot be processed at this time.'}
            </div>
        
    }/>