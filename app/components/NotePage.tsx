import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as PropTypes from 'prop-types';
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
    slug: string;
}
interface NotePageState
{
    slug: string,
    editing: boolean,
    saving: boolean,
    note?: NoteSchema
}
export default class NotePage extends React.Component<NotePageProps, NotePageState>
{
    static contextTypes = { router: PropTypes.object.isRequired };

    context: ReactRouter.RouterChildContext<NotePageProps>;

    private unblockHistory: () => void;

    constructor(props: NotePageProps)
    {
        super(props);
        this.state = {
            slug: props.slug,
            editing: false,
            saving: false
        };
    }

    private fetch()
    {
        fetch('/api/notes/getBySlug/' + this.state.slug).then(result => result.ok ? result.json() : Promise.reject(result.statusText))
            .then(note => this.setState({note}))
            .catch(err => console.error(err, err.stack));
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
                fetch('/api/notes/delete', {method: 'DELETE', headers: new Headers({'Content-Type': 'application/json'}), body: JSON.stringify({slug: this.state.slug})}).then(() => {
                    this.context.router.history.push('/notes');
                }).catch(err => {
                    console.error(err, err.stack);
                })
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
    
                fetch('/api/notes/update', {method: 'POST', headers: new Headers({'Content-Type': 'application/json'}), body: JSON.stringify(data)}).then(result => {
                    if (result.ok)
                        this.setState({editing: false, saving: false});
                    else
                        throw new Error('Result is not OK');
                }).catch(err => {
                    console.error(err, err.stack);
                    this.setState({saving: false});
                });
            }
            break;
        }
    }

    componentDidMount()
    {
        this.fetch();
        this.unblockHistory = (this.context.router.history as any).block((location: any, action: any) => {
            if (this.state.editing || this.state.saving)
                return 'sure?';
        }) as () => void;
    }

    componentWillUnmount()
    {
        this.unblockHistory();
    }

    render()
    {
        if (this.state.note !== undefined)
        {
            const title = <ContentEditable placeholder='Enter Note Title' disabled={!this.state.editing} onChange={t => this.state.note.title = t} value={this.state.note.title}/>;
            const labels = <div className='note-labels row'><div><i className='col fa fa-tags'></i></div><div className='col'>{this.state.editing ?
                <ContentEditable placeholder='label1,label2,label2' onChange={l => this.state.note.labels = l.split(/[, ]+/).filter(s => s.length)} value={this.state.note.labels.join(',')}/> :
                <span>{this.state.note.labels.map(label => <span key={label} className='label note-label'><a href={'/l/' + label}>{label}</a></span>)}</span>}</div></div>;
            const body = this.state.editing ?
                <ContentEditable multiline placeholder='Enter MarkDown content. Make [[links]] with double brackets.' onChange={b => this.state.note.body = b} value={this.state.note.body}/> :
                <RenderMarkup markup={this.state.note.body}/>;
    
            return <div className='note-page'>
                <h1 className='note-title'>{title}</h1>
                {this.state.note.labels.length || this.state.editing ? labels : <span/>}
                <div className='note-body'>{body}</div>
                <ButtonBar editing={this.state.editing} exists={this.state.note.id !== undefined} onClick={a => this.action(a)}/>
            </div>;
        }
        else
        {
            return <div className='note-page'>loading...</div>;
        }
    }
}