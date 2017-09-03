import * as React from 'react';
import { Link } from 'react-router-dom';
import NoteSchema from '../schemas/NoteSchema';

export default class NotesPage extends React.Component<any>
{
    private notes?: NoteSchema[];

    fetch()
    {
        $.getJSON('/api/notes/list').then((data: any) => {
            this.notes = data;
            this.forceUpdate();
        });
    }

    render()
    {
        if (!this.notes)
            this.fetch();

        const links = (() => {
            if (this.notes !== undefined)
            {
                const links = this.notes.map(n => <Link key={n.id} to={'/n/' + n.slug} className="list-group-item"><i className="fa fa-file"></i> {n.title}</Link>);
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