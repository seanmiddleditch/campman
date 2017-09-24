import * as React from 'react';
import {Link} from 'react-router-dom';

const NoteItem = ({note}: {note: {slug?: string, title?: string, subtitle?: string, labels?: string[]}}) => (
    <Link key={note.slug} to={'/n/' + note.slug} className='list-group-item'>
        <div className='list-item-name'><i className='fa fa-file'></i> {note.title}</div>
        <div className='list-item-subtitle'>{note.subtitle}</div>
        <div className='list-item-details comma-separated'>{note.labels.map(l => <span key={l}>{l}</span>)}</div>
    </Link>
);
export default NoteItem;