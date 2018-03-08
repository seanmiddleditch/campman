import * as React from 'react'

export const FormInput = (props: {
    type: 'text'|'datetime-local',
    title?: string,
    className?: string,
    name: string,
    help?: string,
    prefix?: () => React.ReactNode,
    suffix?: () => React.ReactNode,
    value?: string,
    placeholder?: string,
    error?: string,
    disabled?: boolean,
    onChange?: (text: string, name: string) => void
}) => {
    return <div className={`form-group ${props.className || ''}`}>
        {props.title && <label htmlFor={props.name}>{props.title}</label>}
        <div className={`input-group ${props.error ? 'is-invalid' : ''}`}>
            {props.prefix && <div className='input-group-prepend'>{props.prefix()}</div>}
            <input
                type={props.type}
                className={`form-control ${props.error ? 'is-invalid' : ''}`}
                name={props.name}
                value={props.value}
                placeholder={props.placeholder}
                readOnly={!!props.disabled || !props.onChange}
                onChange={ev => props.onChange && props.onChange(ev.target.value, props.name)}
            />
            {props.suffix && <div className='input-group-append'>{props.suffix()}</div>}
        </div>
        {props.help && <div className='form-text text-muted'>{props.help}</div>}
        {props.error && <div className='text-danger'>{props.error || 'Error'}</div>}
    </div>
}

export class DropButton extends React.Component<{
    className?: string
    display: React.ReactNode
    children: React.ReactNode
}, {open: boolean}>
{
    state = {open: false}

    public render()
    {
        return <div className={this.props.className || 'btn-group'} role='group'>
            <button className='btn btn-secondary dropdown-toggle' onClick={() => this.setState({open:!this.state.open})}>{this.props.display}</button>
            <div className={`dropdown-menu ${this.state.open && 'show'}`}>
                {this.props.children}
            </div>
        </div>

    }
}