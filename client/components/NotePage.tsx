import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as PropTypes from 'prop-types';
import ContentEditable from './ContentEditable';
import RenderMarkup from './RenderMarkup';
import {default as ClientGateway, RetrieveNoteResponse} from '../common/ClientGateway';
import NotFoundPage from './NotFoundPage';

interface EditorProps
{
    gateway: ClientGateway
    note: RetrieveNoteResponse,
    exists: boolean,
    onSave: (note: RetrieveNoteResponse) => void,
    onCancel: () => void
}
interface EditorState
{
    saving: boolean,
    note: RetrieveNoteResponse,
}
class Editor extends React.Component<EditorProps, EditorState>
{
    static contextTypes = { router: PropTypes.object.isRequired };
    
    context: ReactRouter.RouterChildContext<NotePageProps>;

    private unblockHistory: () => void;
    
    constructor(props: EditorProps)
    {
        super(props);
        this.state = {
            saving: false,
            note: this.props.note
        };
    }

    private _hasChanges()
    {
        return this.props.note.title != this.state.note.title ||
            this.props.note.body != this.state.note.body ||
            this.props.note.labels.join(',') != this.state.note.labels.join(',')
    }

    private _action(act: 'save'|'edit'|'delete'|'cancel')
    {
        switch (act)
        {
        case 'cancel':
            this.unblockHistory();
            this.props.onCancel();
            break;
        case 'delete':
            if (!this.state.saving)
            {
                this.setState({saving: true});
                this.props.gateway.deleteNote(this.props.note.slug)
                    .then(() => this.context.router.history.push('/notes'))
                    .catch((err: Error) => this.setState({saving: false}));
            }
            break;
        case 'save':
            if (!this.state.saving)
            {
                this.setState({saving: true});
                this.props.gateway.saveNote(this.state.note)
                    .then(() => {this.setState({saving: false}); this.props.onSave(this.state.note);})
                    .catch((err: Error) => this.setState({saving: false}));
            }
            break;
        }
    }

    private _update(fields: {title?: string, labels?: string|string[], body?: string})
    {
        if (fields.title)
            this.state.note.title = fields.title;
        if (typeof fields.labels === 'string')
            this.state.note.labels = fields.labels.split(',').filter(s => s.length);
        else if (fields.labels)
            this.state.note.labels = fields.labels;
        if (fields.body)
            this.state.note.body = fields.body;
    }

    componentDidMount()
    {
        this.unblockHistory = (this.context.router.history as any).block((location: any, action: any) => {
            if (this._hasChanges())
                return 'Navigating away now will lose your changes. Click Cancel to continue editing.';
        }) as () => void;
    }

    componentWillUnmount()
    {
        this.unblockHistory();
    }

    render()
    {
        return <div className='note-editor'>
            <div className='input-group'>
                <span className='input-group-addon'>Title</span>
                <input type='text' className='form-control' onChange={ev => this._update({title: ev.target.value})} defaultValue={this.state.note.title} placeholder='Note Title'/>
            </div>
            <div className='input-group mt-sm-2'>
                <span className='input-group-addon'><i className='col fa fa-tags'></i></span>
                <input type='text' className='form-control' placeholder='tag1, tag2, ...' onChange={ev => this._update({labels: ev.target.value})} defaultValue={this.state.note.labels.join(', ')}/>
            </div>
            <div className='input-group mt-sm-2'>
                <textarea onChange={ev => this._update({body: ev.target.value})} defaultValue={this.state.note.body} style={{width: '100%', minHeight: '20em'}}/>
            </div>
            <div className='btn-group mt-sm-2'>
                <button id='note-btn-save' className='btn btn-primary' about='Save' onClick={() => this._action('save')}><i className='fa fa-floppy-o'></i> Save</button>
                <button id='note-btn-cancel' className='btn btn-default' about='Cancel' onClick={() => this._action('cancel')}><i className='fa fa-ban'></i> Cancel</button>
                <button id='note-btn-delete' className='btn btn-danger' about='Delete' onClick={() => this._action('delete')}><i className='fa fa-trash-o'></i> Delete</button>
            </div>
        </div>;
    }
};

export interface NotePageProps
{
    slug: string,
    gateway: ClientGateway,
}
interface NotePageState
{
    editing: boolean,
    failed: boolean,
    exists: boolean,
    note?: RetrieveNoteResponse
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

    private fetch()
    {
        this.props.gateway.retrieveNote(this.props.slug)
            .then(note => this.setState({note, editing: false, exists: true}))
            .catch(err => {
                if (err.status == 404)
                    this.setState({
                        editing: true,
                        exists: false,
                        note: {
                            slug: this.props.slug,
                            title: '',
                            body: '',
                            labels: []
                        }
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
            return <Editor gateway={this.props.gateway} note={this.state.note} exists={this.state.exists} onSave={(note) => this.setState({note, editing: false})} onCancel={() => this.setState({editing: false})}/>
        }
        else
        {
            // <i className='fa fa-file'></i> 
            return <div className='note-page'>
                <h1 className='note-title'>{this.state.note.title}</h1>
                <div className='note-labels'>
                    <i className='fa fa-tags'></i>&nbsp;
                    <span className='comma-separated'>
                        {this.state.note.labels.map(l => <span key={l} className='label note-label'><a href={'/l/' + l}>{l}</a></span>)}
                    </span>
                </div>
                <div className='note-body'>
                    <RenderMarkup history={this.context.router.history} markup={this.state.note.body}/>
                </div>
                <div className='btn-group'>
                    <button id='note-btn-edit' className='btn btn-default' about='Edit' onClick={() => this.setState({editing: true})}><i className='fa fa-pencil'></i> Edit</button>
                </div>
            </div>;
        }
    }
}