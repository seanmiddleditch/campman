import * as React from 'react'

interface Props
{
    success: boolean
    error?: string
}
export const JoinCampaign = (props: Props) =>
    props.success ?
        <div className='alert alert-primary'>
            You have successfully joined the campaign!
        </div> :
        <div className='alert alert-danger'>
            {props.error || 'We\'re sorry, but your join request is invalid or cannot be processed at this time.'}
        </div>