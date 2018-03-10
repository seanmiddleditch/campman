import * as React from 'react'

export const PreviewBar = (props: {preview: boolean, onChange: (preview: boolean) => void}) => (
    <ul className='nav nav-tabs'>
        <li className="nav-item">
            <a className={'nav-link ' + (!props.preview && 'active')} href='#' onClick={ev => {props.onChange(false); ev.preventDefault()}}>Edit</a>
        </li>
        <li className="nav-item">
            <a className={'nav-link ' + (props.preview && 'active')} href='#' onClick={ev => {props.onChange(true); ev.preventDefault()}}>Preview</a>
        </li>
    </ul>
)
