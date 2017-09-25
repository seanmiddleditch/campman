import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as PropTypes from 'prop-types';

import * as api from '../api';

import ContentEditable from '../components/content-editable';
import Labels from '../components/labels';
import Markdown from '../components/markdown';
import NotFound from '../components/not-found';
import NoteEditor from '../components/note-editor';

export interface NoteViewProps
{
    slug: string
};
interface NoteViewState
{
    editing: boolean,
    failed: boolean,
    exists: boolean,
    note?: api.NoteData
};
export default class NoteView extends React.Component<NoteViewProps, NoteViewState>
{
    static contextTypes = { router: PropTypes.object.isRequired };
    
    context: ReactRouter.RouterChildContext<NoteViewProps>;

    constructor(props: NoteViewProps)
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
            api.notes.delete(this.props.slug)
                .then(() => this.context.router.history.push('/notes'));
        }
    }

    private fetch()
    {
        api.notes.fetch(this.props.slug)
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
        if (!this.state.editing && (!this.state.note || this.props.slug != this.state.note.slug))
            if (!this.state.failed)
                this.fetch();
    }

    render()
    {
        if (this.state.failed)
        {
            return <NotFound/>
        }
        else if (this.state.editing)
        {
            return <div className='note-page'>
                <NoteEditor slug={this.props.slug} note={this.state.note} exists={this.state.exists} onSave={(note) => this.setState({note, editing: false})} onCancel={() => this.setState({editing: false})}/>
            </div>;
        }
        else if (!this.state.note)
        {
            return <div className='note-page'>loading...</div>;
        }
        else
        {
            // <i className='fa fa-file'></i> 
            return <div className='note-page'>
                <h1 className='note-title'>{this.state.note.title}</h1>
                <div className='note-subtitle'>{this.state.note.subtitle}</div>
                {this.state.note.labels && this.state.note.labels.length ?
                    (<div className='note-labels'>
                        <i className='fa fa-tags'></i>&nbsp;
                        {this.state.note.labels.map(l => <span key={l}><span className='label note-label badge badge-pill badge-light'>{l}</span> </span>)}
                    </div>) :
                    <div/>
                }
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
                    <Markdown history={this.context.router.history} markup={this.state.note.body}/>
                </div>
            </div>;
        }
    }
}