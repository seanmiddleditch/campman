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

    render()
    {
        return <div className='content-editable' placeholder={this.props.placeholder} onInput={() => this.emit()} onBlur={() => this.emit()} suppressContentEditableWarning={true} contentEditable={!this.props.disabled}>{this.props.children}</div>;
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