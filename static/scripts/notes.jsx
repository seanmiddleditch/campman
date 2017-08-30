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
        return <div onInput={() => this.emit()} onBlur={() => this.emit()} suppressContentEditableWarning={true} contentEditable={!this.props.disabled}>{this.props.children}</div>;
    }
}

function NoteTitle(props)
{
    return <h1 className="note-title" id="input-note-title"><ContentEditable disabled={!props.editing} onChange={(value) => props.onChange(value)}>{props.title}</ContentEditable></h1>;
}

function NoteLabels(props)
{
    const labels = props.labels.map(label => <span key={label} className="label note-label"><a href={'/l/' + label}>{label}</a></span>);
    if (labels.length)
        return <div className="note-labels"><i className="fa fa-tags"></i> <span>{labels}</span></div>;
    else
        return <span/>;
}

function NoteBody(props)
{
    return <div className="note-body"><ContentEditable disabled={!props.editing} onChange={props.onChange}>{props.body}</ContentEditable></div>;
}

function Button(props)
{
    return <button className={'btn btn-' + props.buttonClass || 'default'} id="{props.id}" onClick={props.action}>{props.children}</button>
}

function NoteEditBar(props)
{
    if (props.editing && props.id)
        return <div className="btn-group">
            <Button buttonClass='primary' title='Save' action={props.onSave}><i className="fa fa-floppy-o"></i> Save</Button>
            <Button buttonClass='default' title='Cancel' action={props.onCancel}><i className="fa fa-ban"></i> Cancel</Button>
            <Button buttonClass='danger' title='Delete' action={props.onDelete}><i className="fa fa-trash-o"></i> Delete</Button>
        </div>;
    else if (props.editing)
        return <div className="btn-group">
            <Button buttonClass='primary' title='Save' action={props.onSave}><i className="fa fa-floppy-o"></i> Save</Button>
        </div>;
    else
        return <div className="btn-group">
            <Button buttonClass='default' title='Edit' action={props.onEdit}><i className="fa fa-pencil"></i> Edit</Button>
        </div>;
}

class Note extends React.Component
{
    constructor(props)
    {
        super(props);
        const state = this.state = {
            editing: !note.id,
            id: note.id,
            saving: false,
            title: note.title,
            body: note.body,
            labels: note.labels
        };
    }

    edit()
    {
        const state = this.state;
        this.setState({
            editing: true,
            oldTitle: state.title,
            oldBody: state.body,
            oldLabels: state.labels
        });
    }

    cancel()
    {
        const state = this.state;
        this.setState({
            editing: false,
            title: state.oldTitle,
            body: state.oldBody,
            labels: state.oldLabels
        });
    }

    save()
    {
        if (this.state.editing && !this.state.saving)
        {
            this.setState({saving: true});

            const data = {
                title: this.state.title,
                body: this.state.body
            };

            $.ajax({url: window.location, method: 'POST', data: data}).then(() => {
                this.setState({editing: false, saving: false});
            }, () => {
                this.setState({saving: false});
            });
        }
    }

    delete()
    {
        if (this.state.editing && !this.state.saving)
        {
            $.ajax({url: window.location, method: 'DELETE'}).then(() => {
                window.location = '/notes';
            });
        }
    }

    render()
    {
        return <div>
            <NoteTitle editing={this.state.editing} title={this.state.title} onChange={(value) => this.setState({title: value})}/>
            <NoteLabels labels={this.state.labels} editing={this.props.editing}/>
            <NoteBody editing={this.state.editing} body={this.state.body} onChange={(value) => this.setState({body: value})}/>
            <NoteEditBar editing={this.state.editing} onEdit={() => this.edit()} onCancel={() => this.cancel()} onSave={() => this.save()} onDelete={() => this.delete()}/>
        </div>;
    }
}