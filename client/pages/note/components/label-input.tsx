import * as React from 'react'

export interface LabelInputProps
{
    labels: string[]
    disabled?: boolean
    onAdd: (label: string) => void
    onRemove: (label: string) => void
    onComplete?: (prefix: string) => string[]
}
interface LabalInputState
{
    input: string
    focused: boolean
}
export default class LabelInput extends React.Component<LabelInputProps, LabalInputState>
{
    refs: {
        input: HTMLInputElement
    }

    constructor(props: LabelInputProps)
    {
        super(props);
        this.state = {
            input: '',
            focused: false
        };
    }

    private _publish()
    {
        const label = this.state.input.replace(/-$/, '');
        if (label.length >= 2)
        {
            this.setState({input: ''});
            this.props.onAdd(label);
        }
    }

    private _handleChange(label: string)
    {
        this.setState({
            input: label
                .toLowerCase()
                .replace(/[^a-z0-9-]+/g, '-')
                .replace(/[-]+/, '-')
                .replace(/^-/, '')
                .trim()
                .substr(0, 16)
        });
    }

    private _handleBlur(ev: React.FocusEvent<HTMLInputElement>)
    {
        this._publish();
        this.setState({focused: false});
    }

    private _handleFocus(ev: React.FocusEvent<HTMLInputElement>)
    {
        this.setState({focused: true});
    }

    private _handleClick(ev: React.MouseEvent<HTMLElement>)
    {
        if (!ev.defaultPrevented)
        {
            this.refs.input.focus();
        }
    }

    private _handleKeyDown(ev: React.KeyboardEvent<HTMLInputElement>)
    {
        if (ev.key === 'Enter' || ev.key === ',' || ev.key === ' ')
        {
            this._publish();
            ev.preventDefault();
        }
    }

    render()
    {
        return <span className={'form-control form-control-label-input ' + (this.state.focused ? 'focused' : 'blurred')} onClick={ev => this._handleClick(ev)}>
            <span className='form-control-label-input-wrapper'>
                {this.props.labels.map(label => 
                    <span key={label} className='label badge badge-light'>
                        {label}<span className='fa fa-times' onClick={() => this.props.onRemove(label)}></span>
                    </span>
                )}
                <input ref='input' type='text'
                    disabled={this.props.disabled}
                    value={this.state.input}
                    onChange={ev => this._handleChange(ev.target.value)}
                    onBlur={ev => this._handleBlur(ev)}
                    onFocus={ev => this._handleFocus(ev)}
                    onKeyDown={ev => this._handleKeyDown(ev)}
                    placeholder='Enter tag here'
                />
            </span>
        </span>;
    }
}