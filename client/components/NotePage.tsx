import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as PropTypes from 'prop-types';
import ContentEditable from './ContentEditable';
import RenderMarkup from './RenderMarkup';
import {default as ClientGateway, RetrieveNoteResponse} from '../common/ClientGateway';
import NotFoundPage from './NotFoundPage';

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
    slug: string,
    gateway: ClientGateway
}
interface NotePageState
{
    editing: boolean,
    saving: boolean,
    exists: boolean,
    failed: boolean,
    note?: RetrieveNoteResponse
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
            editing: false,
            exists: false,
            saving: false,
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
                this.props.gateway.deleteNote(this.props.slug).then(() => this.context.router.history.push('/notes'));
            }
            break;
        case 'save':
            if (this.state.editing && !this.state.saving)
            {
                this.setState({saving: true});
                this.props.gateway.saveNote(this.state.note).then(() => this.setState({editing: false, saving: false})).catch(err => this.setState({saving: false}));
            }
            break;
        }
    }

    componentDidMount()
    {
        this.fetch();
        this.unblockHistory = (this.context.router.history as any).block((location: any, action: any) => {
            if (this.state.editing || this.state.saving)
                return 'Navigating away now will lose your changes. Click Cancel to continue editing.';
        }) as () => void;
    }

    componentWillUnmount()
    {
        this.unblockHistory();
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
        else
        {
            const title = <ContentEditable placeholder='Enter Note Title' disabled={!this.state.editing} onChange={t => this.state.note.title = t} value={this.state.note.title}/>;
            const labels = <div className='note-labels row'><div><i className='col fa fa-tags'></i></div><div className='col'>{this.state.editing ?
                <ContentEditable placeholder='label1,label2,label2' onChange={l => this.state.note.labels = l.split(/[, ]+/).filter(s => s.length)} value={this.state.note.labels.join(',')}/> :
                <span className='comma-separated'>{this.state.note.labels.map(l => <span key={l} className='label note-label'><a href={'/l/' + l}>{l}</a></span>)}</span>}</div></div>;
            const body = this.state.editing ?
                <ContentEditable multiline placeholder='Enter MarkDown content. Make [[links]] with double brackets.' onChange={b => this.state.note.body = b} value={this.state.note.body}/> :
                <RenderMarkup history={this.context.router.history} markup={this.state.note.body}/>;
    
            // <i className='fa fa-file'></i> 
            return <div className='note-page'>
                <h1 className='note-title'>{title}</h1>
                {this.state.note.labels.length || this.state.editing ? labels : <span/>}
                <div className='note-body'>{body}</div>
                <ButtonBar editing={this.state.editing} exists={this.state.exists} onClick={a => this.action(a)}/>
            </div>;
        }
    }
}