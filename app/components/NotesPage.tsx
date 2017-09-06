import * as React from 'react';
import { Link } from 'react-router-dom';
import NoteSchema from '../schemas/NoteSchema';

interface NotesPageState
{
    notes?: NoteSchema[];
}
export default class NotesPage extends React.Component<{}, NotesPageState>
{
    constructor()
    {
        super();
        this.state = {};
    }

    private fetch()
    {
        fetch('/api/notes/list').then(result => result.ok ? result.json() : Promise.reject(result.statusText))
            .then(notes => this.setState({notes}))
            .catch(err => console.error(err, err.stack));
    }

    componentDidMount()
    {  
        this.fetch();
    }

    render()
    {
        const links = (() => {
            if (this.state.notes !== undefined)
            {
                const links = this.state.notes.map(n => <Link key={n.id} to={'/n/' + n.slug} className="list-group-item"><i className="fa fa-file"></i> {n.title}</Link>);
                return <div className="list-group">
                    {links}
                    <Link to="/create/note" className="list-group-item"><i className="fa fa-plus"></i> New Note</Link>
                </div>;
            }
            else
            {
                return <div>loading...</div>;
            }
        })();

        return <div>
            <div className="page-header">
                <h1><i className="fa fa-book"></i> Notes</h1>
            </div>
            {links}
        </div>;
    }
}