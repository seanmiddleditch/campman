import * as React from 'react'

export default function Subtitle(props: {subtitle?: string})
{
    return props.subtitle ? (
        <div className='note-subtitle'>{props.subtitle}</div>
    ) : <span/>
}