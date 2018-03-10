import * as React from 'react'
import {StateConsumer} from '../state-context'

export class AccessDenied extends React.Component
{
    public render()
    {
        return <StateConsumer render={state => {
            if (state.profile)
                return <p>Plase Login</p>
            else
                return <p>This resource is protected.</p>
        }}/>
    }
}