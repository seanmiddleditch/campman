import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as ReactRouter from 'react-router';
import * as JQuery from 'jquery';
import {Link} from 'react-router-dom';
import * as api from '../api/index';

const NewNoteButton = () => (
    <button className='btn btn-default' data-toggle='modal' data-target='#new-note-dialog'>
        <i className='fa fa-plus'></i> New Note
    </button>
);

class NewNoteDialog extends React.Component<{}>
{
    refs: {
        modal: HTMLDivElement,
        slug: HTMLInputElement,
        title: HTMLInputElement
    }

    private _handleClick(ev: React.MouseEvent<HTMLButtonElement>)
    {
        const slug = this.refs.slug.value || this.refs.slug.placeholder;
        api.notes.update(slug, {title: this.refs.title.value})
            .then(() => (JQuery('#new-notes-dialog') as any).modal('hide'))
            .then(note => this.context.router.history.push(`/n/${slug}`));
        ev.preventDefault();
    }

    private _updateSlug(ev: React.ChangeEvent<HTMLInputElement>)
    {
        const title = ev.target.value.length ? ev.target.value : ev.target.placeholder;
        this.refs.slug.placeholder = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').slice(0, 32).trim().replace(/ /g, '-');
    }

    render()
    {
        return (
            <div>
                <div ref='modal' className='modal' id='new-note-dialog' data-backdrop='static' role='dialog'>
                    <div className='modal-dialog' role='document'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                New Note
                            </div>
                            <div className='modal-body'>
                                <div className='form-group'>
                                    <label htmlFor='title'>Title</label>
                                    <input className='form-control' ref='title' type='text' placeholder='An Interesting Note' onChange={ev => this._updateSlug(ev)}/>
                                </div>
                                <div className='form-group'>
                                    <label htmlFor='slug'>Slug</label>
                                    <input className='form-control' ref='slug' type='text' placeholder='an-interesting-note'/>
                                </div>
                            </div>
                            <div className='modal-footer'>
                                <button className='btn btn-secondary' data-dismiss='modal'>Cancel</button>
                                <button className='btn btn-primary' onClick={ev => this._handleClick(ev)}>Create Note</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

interface NotesViewState
{
    notes?: api.NoteData[];
}
export default class NotesView extends React.Component<{}, NotesViewState>
{
    static contextTypes = { router: PropTypes.object.isRequired };
    
    context: ReactRouter.RouterChildContext<{}>;

    constructor()
    {
        super();
        this.state = {};
    }

    componentDidMount()
    {  
        api.notes.fetchAll()
            .then(notes => this.setState({notes}))
            .catch(err => {
                console.log(err, err.stack);
                this.setState({notes: []});
            });
    }

    private renderNote(n: api.NoteData)
    {
        return <Link key={n.slug} to={'/n/' + n.slug} className='list-group-item'>
            <div className='list-item-name'><i className='fa fa-file'></i> {n.title}</div>
            <div className='list-item-subtitle'>{n.subtitle}</div>
            <div className='list-item-details comma-separated'>{n.labels.map(l => <span key={l}>{l}</span>)}</div>
        </Link>;
    }

    render()
    {
        const notes = (() => {
            if (this.state.notes === undefined)
            {
                return <div>loading...</div>;
            }
            else if (this.state.notes.length == 0)
            {
                return <div>No notes are available</div>;
            }
            else
            {
                const links = this.state.notes.map(n => this.renderNote(n));
                return <div className='list-group'>
                    {links}
                    <div className='list-group-item'>
                        <NewNoteButton/>
                    </div>
                </div>;
            }
        })();

        return <div>
            <div className='page-header'>
                <h1><i className='fa fa-book'></i> Notes</h1>
            </div>
            <NewNoteDialog/>
            {notes}
        </div>;
    }
}