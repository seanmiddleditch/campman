import * as React from 'react';
import {Link} from 'react-router-dom';
import * as api from '../api/index';

interface NotesViewState
{
    notes?: api.NoteData[];
}
export default class NotesView extends React.Component<{}, NotesViewState>
{
    constructor()
    {
        super();
        this.state = {};
    }

    componentDidMount()
    {  
        api.notes.fetchAll().then(notes => this.setState({notes}));
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
        const links = (() => {
            if (this.state.notes !== undefined)
            {
                const links = this.state.notes.map(n => this.renderNote(n));
                return <div className='list-group'>
                    {links}
                    <Link to='/create/note' className='list-group-item'><i className='fa fa-plus'></i> New Note</Link>
                </div>;
            }
            else
            {
                return <div>loading...</div>;
            }
        })();

        return <div>
            <div className='page-header'>
                <h1><i className='fa fa-book'></i> Notes</h1>
            </div>
            {links}
        </div>;
    }
}