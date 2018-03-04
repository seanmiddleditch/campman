import * as React from 'react'
import {StateConsumer} from '../state'

export class AccessDenied extends React.Component
{
    public render()
    {
        return <StateConsumer render={state => {
            if (state.config.profile)
                return <p>Plase Login</p>
            else
                return <p>This resource is protected.</p>
        }}/>
    }
}