import * as React from 'react'

export function SecretBlock(props: {children: any})
{
    return (
        <div className='secret'>{props.children}</div>
    )
}
