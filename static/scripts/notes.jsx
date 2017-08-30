function NoteTitle(props)
{
    return <h1 className='note-title' id='input-note-title'><ContentEditable placeholder='Enter Note Title' disabled={!props.editing} onChange={(value) => props.onChange(value)}>{props.title}</ContentEditable></h1>;
}

function NoteLabels(props)
{
    const labels = props.labels.map(label => <span key={label} className='label note-label'><a href={'/l/' + label}>{label}</a></span>);
    if (labels.length)
        return <div className='note-labels'><i className='fa fa-tags'></i> <span>{labels}</span></div>;
    else
        return <span/>;
}

function NoteBody(props)
{
    if (props.editing)
        return <div className='note-body'><ContentEditable placeholder='Enter MarkDown content. Make [[links]] with double brackets.' onChange={props.onChange}>{props.body}</ContentEditable></div>;
    else
        return <div className='note-body'><RenderMarkup markup={props.body}/></div>
}

function NoteEditBar(props)
{
    if (props.editing && !props.isNew)
        return <ButtonBar>
            <Button buttonClass='primary' title='Save' action={props.onSave}><i className='fa fa-floppy-o'></i> Save</Button>
            <Button buttonClass='default' title='Cancel' action={props.onCancel}><i className='fa fa-ban'></i> Cancel</Button>
            <Button buttonClass='danger' title='Delete' action={props.onDelete}><i className='fa fa-trash-o'></i> Delete</Button>
        </ButtonBar>;
    else if (props.editing)
        return <ButtonBar>
            <Button buttonClass='primary' title='Save' action={props.onSave}><i className='fa fa-floppy-o'></i> Save</Button>
        </ButtonBar>;
    else
        return <ButtonBar>
            <Button buttonClass='default' title='Edit' action={props.onEdit}><i className='fa fa-pencil'></i> Edit</Button>
        </ButtonBar>;
}

class Note extends React.Component
{
    constructor(props)
    {
        super(props);
        const note = props.note;
        this.state = {
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
            <NoteLabels editing={this.props.editing} labels={this.state.labels} onChange={(value) => this.setState({labels: value})}/>
            <NoteBody editing={this.state.editing} body={this.state.body} onChange={(value) => this.setState({body: value})}/>
            <NoteEditBar editing={this.state.editing} isNew={!this.state.id} onEdit={() => this.edit()} onCancel={() => this.cancel()} onSave={() => this.save()} onDelete={() => this.delete()}/>
        </div>;
    }
}