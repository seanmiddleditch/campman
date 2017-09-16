import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as PropTypes from 'prop-types';
import ContentEditable from './ContentEditable';
import RenderMarkup from './RenderMarkup';
import {Library, Note} from '../common/ClientGateway';
import LabelInput from './LabelInput';
import NotFoundPage from './NotFoundPage';

interface NoteEditorProps
{
    note: Note,
    exists: boolean,
    onSave: (note: Note) => void,
    onCancel: () => void
}
interface NoteEditorState
{
    saving: boolean,
    label: string,
    title: string,
    subtitle: string,
    labels: string[],
    body: string
}
class NoteEditor extends React.Component<NoteEditorProps, NoteEditorState>
{
    static contextTypes = { router: PropTypes.object.isRequired };
    
    context: ReactRouter.RouterChildContext<NoteEditorProps>;

    private unblockHistory: () => void;
    
    constructor(props: NoteEditorProps)
    {
        super(props);
        this.state = {
            saving: false,
            title: props.note.title,
            subtitle: props.note.subtitle,
            labels: props.note.labels,
            body: props.note.body,
            label: ''
        };
    }

    private _hasChanges()
    {
        return this.props.note.title !== this.state.title ||
            this.props.note.subtitle !== this.state.subtitle ||
            this.props.note.body !== this.state.body ||
            this.props.note.labels.join(',') !== this.state.labels.join(',')
    }

    private _save()
    {
        if (!this.state.saving)
        {
            this.setState({saving: true});
            this.props.note.title = this.state.title;
            this.props.note.subtitle = this.state.subtitle;
            this.props.note.labels = this.state.labels;
            this.props.note.body = this.state.body;
            this.props.note.update()
                .then(() => {this.setState({saving: false}); this.props.onSave(this.props.note);})
                .catch((err: Error) => this.setState({saving: false}));
        }
    }

    private _cancel()
    {
        if (!this._hasChanges() || confirm('Canceling now will lose your changes. Click Cancel to continue editing.'))
        {
            this.unblockHistory();
            this.props.onCancel();
        }
    }

    private _removeLabel(label: string)
    {
        const index = this.state.labels.findIndex(l => l === label);
        if (index !== -1)
        {
            this.state.labels.splice(index, 1);
            this.setState({labels: this.state.labels});
        }
    }

    private _addLabel(label: string)
    {
        const index = this.state.labels.findIndex(l => l === label);
        if (index === -1)
        {
            this.state.labels.push(label);
            this.setState({labels: this.state.labels, label: ''});
        }
    }

    private _update(fields: {title?: string, subtitle?: string, labels?: string|string[], body?: string})
    {
        if (fields.title)
            this.setState({title: fields.title});
        if (fields.subtitle)
            this.setState({subtitle: fields.subtitle});
        if (typeof fields.labels === 'string')
            this.setState({labels: fields.labels.split(',').filter(s => s.length)});
        else if (fields.labels)
            this.setState({labels: fields.labels});
        if (fields.body)
            this.setState({body: fields.body});
    }

    componentDidMount()
    {
        this.unblockHistory = (this.context.router.history as any).block((location: any, action: any) => {
            if (this._hasChanges())
                return 'Navigating away now will lose your changes. Click Cancel to continue editing.';
            else
                return undefined;
        }) as () => void;
    }

    componentWillUnmount()
    {
        this.unblockHistory();
    }

    render()
    {
        //<input type='text' className='form-control' placeholder='tag1, tag2, ...' onChange={ev => this._update({labels: ev.target.value})} defaultValue={this.state.note.labels.join(', ')}/>
        return <div className='note-editor'>
            <div className='input-group'>
                <span className='input-group-addon'>Title</span>
                <input type='text' className='form-control' onChange={ev => this._update({title: ev.target.value})} defaultValue={this.state.title} placeholder='Note Title'/>
            </div>
            <div className='input-group mt-sm-2'>
                <span className='input-group-addon'>Subtitle</span>
                <input type='text' className='form-control' onChange={ev => this._update({subtitle: ev.target.value})} defaultValue={this.state.subtitle} placeholder='Subtitle'/>
            </div>
            <div className='input-group mt-sm-2'>
                <span className='input-group-addon'><i className='col fa fa-tags'></i></span>
                <LabelInput labels={this.state.labels} onAdd={label => this._addLabel(label)} onRemove={label => this._removeLabel(label)}/>
            </div>
            <div className='floating-editbar-container'>
                <div className='floating-editbar'>
                    <div className='btn-group mt-sm-2' role='group'>
                        <button id='note-btn-save' className='btn btn-primary' about='Save' onClick={() => this._save()}><i className='fa fa-floppy-o'></i> Save</button>
                        <div className='btn-group'>
                            <button className='btn btn-primary dropdown-toggle dropdown-toggle-split' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'><span className='caret'/></button>
                            <div className='dropdown-menu'>
                                <button id='note-btn-cancel' className='dropdown-item' about='Cancel' onClick={() => this._cancel()}><i className='fa fa-ban'></i> Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='input-group mt-sm-2'>
                <textarea onChange={ev => this._update({body: ev.target.value})} defaultValue={this.state.body} style={{width: '100%', minHeight: '20em'}}/>
            </div>
        </div>;
    }
};

export interface NotePageProps
{
    slug: string,
    library: Library,
}
interface NotePageState
{
    editing: boolean,
    failed: boolean,
    exists: boolean,
    note?: Note
}
export default class NotePage extends React.Component<NotePageProps, NotePageState>
{
    static contextTypes = { router: PropTypes.object.isRequired };
    
    context: ReactRouter.RouterChildContext<NotePageProps>;

    constructor(props: NotePageProps)
    {
        super(props);
        this.state = {
            editing: false,
            exists: false,
            failed: false
        };
    }

    private _delete()
    {
        if (confirm('This operation cannot be reversed! Click Cancel to keep this page.'))
        {
            this.state.note.delete()
                .then(() => this.context.router.history.push('/notes'));
        }
    }

    private fetch()
    {
        this.props.library.note(this.props.slug)
            .then(note => this.setState({note, editing: false, exists: true}))
            .catch(err => {
                if (err.status == 404)
                    this.setState({
                        editing: true,
                        exists: false,
                        note: null
                    });
                else if (err.status == 401)
                    this.setState({failed: true});
            });
    }

    componentWillMount()
    {
        this.fetch();
    }

    componentDidUpdate()
    {
        if (!this.state.note || this.props.slug != this.state.note.slug)
            if (!this.state.failed)
                this.fetch();
    }

    render()
    {
        if (this.state.failed)
        {
            return <NotFoundPage/>
        }
        else if (!this.state.note)
        {
            return <div className='note-page'>loading...</div>;
        }
        else if (this.state.editing)
        {
            return <div className='note-page'>
                <NoteEditor note={this.state.note} exists={this.state.exists} onSave={(note) => this.setState({note, editing: false})} onCancel={() => this.setState({editing: false})}/>
            </div>;
        }
        else
        {
            // <i className='fa fa-file'></i> 
            return <div className='note-page'>
                <h1 className='note-title'>{this.state.note.title}</h1>
                <div className='note-subtitle'>{this.state.note.subtitle}</div>
                <div className='note-labels'>
                    <i className='fa fa-tags'></i>&nbsp;
                    {this.state.note.labels.map(l => <span key={l}><span className='label note-label badge badge-pill badge-light'>{l}</span> </span>)}
                </div>
                <div className='floating-editbar-container'>
                    <div className='floating-editbar'>
                        <div className='btn-group'>
                            <button id='note-btn-edit' className='btn btn-default' about='Edit' onClick={() => this.setState({editing: true})}><i className='fa fa-pencil'></i> Edit</button>
                            <div className='btn-group'>
                                <button className='btn dropdown-toggle dropdown-toggle-split' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'><span className='caret'/></button>
                                <div className='dropdown-menu'>
                                    <button id='note-btn-delete btn-danger' className='dropdown-item btn-danger' about='Delete' onClick={() => this._delete()}><i className='fa fa-trash-o'></i> Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='note-body'>
                    <RenderMarkup history={this.context.router.history} markup={this.state.note.body}/>
                </div>
            </div>;
        }
    }
}