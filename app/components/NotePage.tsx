import * as React from 'react';
import ContentEditable from './ContentEditable';
import RenderMarkup from './RenderMarkup';
import NoteSchema from '../schemas/NoteSchema';

interface ButtonBarProps
{
    exists?: boolean,
    editing?: boolean,
    onClick: (action: 'save'|'edit'|'cancel'|'delete') => void
}
function ButtonBar(props: ButtonBarProps)
{
    if (props.editing && props.exists)
        return <div className='btn-group'>
            <button id='note-btn-save' className='btn btn-primary' about='Save' onClick={() => props.onClick('save')}><i className='fa fa-floppy-o'></i> Save</button>
            <button id='note-btn-cancel' className='btn btn-default' about='Cancel' onClick={() => props.onClick('cancel')}><i className='fa fa-ban'></i> Cancel</button>
            <button id='note-btn-delete' className='btn btn-danger' about='Delete' onClick={() => props.onClick('delete')}><i className='fa fa-trash-o'></i> Delete</button>
        </div>;
    else if (props.editing)
        return <div className='btn-group'>
            <button id='note-btn-save' className='btn btn-primary' about='Save' onClick={() => props.onClick('save')}><i className='fa fa-floppy-o'></i> Save</button>
        </div>;
    else
        return <div className='btn-group'>
            <button id='note-btn-edit' className='btn btn-default' about='Edit' onClick={() => props.onClick('edit')}><i className='fa fa-pencil'></i> Edit</button>
        </div>;
}

export interface NotePageProps
{
    slug: string
}
interface NotePageState
{
    editing: boolean,
    saving: boolean,
    note?: NoteSchema
}
export default class NotePage extends React.Component<NotePageProps, NotePageState>
{
    constructor(props: NotePageProps)
    {
        super(props);
        this.state = {
            editing: false,
            saving: false
        };
    }

    private fetch()
    {
        $.getJSON('/api/notes/getBySlug/' + this.props.slug).then((data: any) => {
            this.setState({note: data});
        });
    }

    private action(act: 'save'|'edit'|'delete'|'cancel')
    {
        switch (act)
        {
        case 'edit':
            this.setState({
                editing: true
            });
            break;
        case 'cancel':
            this.setState({
                editing: false
            });
            break;
        case 'delete':
            if (this.state.editing && !this.state.saving)
            {
                $.ajax({url: '/api/notes/delete', method: 'DELETE', data: {slug: this.state.note.slug}}).then(() => {
                    window.location.assign('/notes');
                });
            }
            break;
        case 'save':
            if (this.state.editing && !this.state.saving)
            {
                this.setState({saving: true});
    
                const data = {
                    slug: this.state.note.slug,
                    title: this.state.note.title,
                    body: this.state.note.body,
                    labels: this.state.note.labels
                };
    
                $.ajax({url: '/api/notes/update', method: 'POST', data: data}).then(() => {
                    this.setState({editing: false, saving: false});
                }, () => {
                    this.setState({saving: false});
                });
            }
            break;
        }
    }

    render()
    {
        if (this.state.note !== undefined)
        {
            const title = <ContentEditable placeholder='Enter Note Title' disabled={!this.state.editing} onChange={t => this.state.note.title = t} value={this.state.note.title}/>;
            const labels = this.state.editing ?
                <div className='note-labels'><i className='fa fa-tags'></i> <ContentEditable placeholder='label1,label2,label2' onChange={l => this.state.note.labels = l.split(/[, ]+/).filter(s => s.length)} value={this.state.note.labels.join(',')}/></div> :
                <div className='note-labels'><i className='fa fa-tags'></i> <span>{this.state.note.labels.map(label => <span key={label} className='label note-label'><a href={'/l/' + label}>{label}</a></span>)}</span></div>;
            const body = this.state.editing ?
                <ContentEditable multiline placeholder='Enter MarkDown content. Make [[links]] with double brackets.' onChange={b => this.state.note.body = b} value={this.state.note.body}/> :
                <RenderMarkup markup={this.state.note.body}/>;
    
            return <div>
                <h1 className='note-title'>{title}</h1>
                {this.state.note.labels.length ? labels : <span/>}
                <div className='note-body'>{body}</div>
                <ButtonBar editing={this.state.editing} exists={this.state.note.id !== undefined} onClick={a => this.action(a)}/>
            </div>;
        }
        else
        {
            this.fetch();
            return <div>loading...</div>;
        }
    }
}