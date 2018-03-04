import * as React from 'react'

export const FormInput = (props: {
    type: 'text',
    title: string,
    className?: string,
    name: string,
    help?: string,
    prefix?: () => React.ReactNode,
    suffix?: () => React.ReactNode,
    placeholder?: string,
    error?: string,
    disabled?: boolean,
    onChange: (text: string, name: string) => void
}) => {
    return <div className={`form-group ${props.className || ''}`}>
        <label htmlFor={props.name}>{props.title}</label>
        <div className={`input-group ${props.error ? 'is-invalid' : ''}`}>
            {props.prefix && <div className='input-group-prepend'>{props.prefix()}</div>}
            <input
                type={props.type}
                className={`form-control ${props.error ? 'is-invalid' : ''}`}
                name={props.name}
                placeholder={props.placeholder}
                readOnly={!!props.disabled}
                onChange={ev => props.onChange(ev.target.value, props.name)}
            />
            {props.suffix && <div className='input-group-append'>{props.suffix()}</div>}
        </div>
        {props.help && <div className='form-text text-muted'>{props.help}</div>}
        {props.error && <div className='text-danger'>{props.error || 'Error'}</div>}
    </div>
}