import * as React from 'react'

export function SecretBlock(props: {children: any})
{
    return (
        <blockquote className='alert alert-dark'>{props.children}</blockquote>
    )
}
