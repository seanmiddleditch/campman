class ContentEditable extends React.Component
{
    constructor(props)
    {
        super(props);
        this.lastValue = props.value;
        this.onChange = props.onChange;
    }

    shouldComponentUpdate(nextProps)
    {
        return nextProps.value != ReactDOM.findDOMNode(this).innerText;
    }

    emit()
    {
        const value = ReactDOM.findDOMNode(this).innerText;
        if (value != this.lastValue)
        {
            this.onChange(value);
            this.lastValue = value;
        }
    }

    filter(e)
    {
        if (!this.props.multiple && e.key == 'Enter')
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
            return <div className='content-editable' placeholder={this.props.placeholder} onBlur={() => this.emit()} suppressContentEditableWarning={true} contentEditable={!this.props.disabled}>{this.props.children}</div>;
        else
            return <span className='content-editable' placeholder={this.props.placeholder} onKeyDown={(e) => this.filter(e)} onBlur={() => this.emit()} suppressContentEditableWarning={true} contentEditable={!this.props.disabled}>{this.props.children}</span>;
    }
}

function Button(props)
{
    return <button className={'btn btn-' + props.buttonClass || 'default'} id="{props.id}" onClick={props.action}>{props.children}</button>
}

function ButtonBar(props)
{
    return <div className='btn-group'>{props.children}</div>;
}