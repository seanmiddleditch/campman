import * as React from 'react'
import { Authenticated } from '../containers/authenticated'

export class AccessDenied extends React.Component
{
    public render()
    {
        return <Authenticated render={({profile, login}) => 
            (!profile) ?
                <p><button onClick={login}>Please Login</button></p> :
                <p>This resource is protected.</p>
        }/>
    }
}