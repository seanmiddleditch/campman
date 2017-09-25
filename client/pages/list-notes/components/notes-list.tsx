import * as React from 'react'

import NoteItem from './note-item';

import * as api from '../../../api/index'

interface NotesListProps
{
    children?: any
}
interface NotesListState
{
    notes?: api.NoteData[]
}
export default class NotesList extends React.Component<NotesListProps, NotesListState>
{
    constructor(props: NotesListProps)
    {
        super(props)
        this.state = {}
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

    render()
    {
        return (
            <div className='list-group'>
                {this.state.notes === undefined ?
                    <div className='list-group-item'>loading...</div> :
                    this.state.notes.map(n => <NoteItem note={n}/>)}
                {this.props.children}
            </div>
        )
    }
}