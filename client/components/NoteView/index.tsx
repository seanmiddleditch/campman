import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as PropTypes from 'prop-types';

import {Library, Note} from '../../common/ClientGateway';

import ContentEditable from '../ContentEditable';
import Labels from '../Labels';
import RenderMarkup from '../RenderMarkup';
import LabelInput from '../LabelInput';
import NotFoundPage from '../NotFoundPage';

import NoteEditor from './NoteEditor';

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