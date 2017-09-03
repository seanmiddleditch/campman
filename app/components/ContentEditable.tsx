import * as React from 'react';

export interface ContentEditableProps
{
    value: string,
    onChange: (v: string) => void,
    multiline?: boolean,
    disabled?: boolean,
    placeholder?: string
};
export default class ContentEditable extends React.Component<ContentEditableProps, undefined>
{
    private lastValue: string;
    private onChange: (v: string) => void;
    private view: HTMLElement;

    constructor(props: ContentEditableProps)
    {
        super(props);
        this.lastValue = props.value;
        this.onChange = props.onChange;
    }

    shouldComponentUpdate(nextProps: ContentEditableProps): boolean
    {
        return nextProps.value != this.view.innerText;
    }

    emit()
    {
        const value = this.view.innerText;
        if (value != this.lastValue)
        {
            this.onChange(value);
            this.lastValue = value;
        }
    }

    filter(e: React.KeyboardEvent<HTMLSpanElement>)
    {
        if (!this.props.multiline && e.key == 'Enter')
        {
            e.stopPropagation();
            e.preventDefault();
            return false;            
        }
        else
        {
            return true;
        }
    }

    render()
    {
        if (this.props.multiline)
            return <div ref={el => this.view = el} className='content-editable' data-placeholder={this.props.placeholder} onBlur={() => this.emit()} suppressContentEditableWarning={true} contentEditable={!this.props.disabled}>{this.props.value}</div>;
        else
            return <span ref={el => this.view = el} className='content-editable' data-placeholder={this.props.placeholder} onKeyDown={(e) => this.filter(e)} onBlur={() => this.emit()} suppressContentEditableWarning={true} contentEditable={!this.props.disabled}>{this.props.value}</span>;
    }
}