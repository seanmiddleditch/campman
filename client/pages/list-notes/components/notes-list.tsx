import * as React from 'react'

import {NoteItem} from './note-item';

import * as api from '../../../api'
import {Note} from '../../../types'

interface NotesListProps
{
    children?: any
    labels?: string|string[]
}
interface NotesListState
{
    notes?: Note[]
}
export class NotesList extends React.Component<NotesListProps, NotesListState>
{
    constructor(props: NotesListProps)
    {
        super(props)
        this.state = {}
    }

    private _fetch(labels: string|string[]|undefined)
    {
        api.notes.fetchAll({labels})
            .then(notes => this.setState({notes}))
            .catch(err => {
                console.log(err, err.stack);
                this.setState({notes: []});
            });
    }

    componentDidMount()
    {  
        this._fetch(this.props.labels)
    }

    componentWillReceiveProps(nextProps: NotesListProps)
    {
        const {labels} = this.props
        const nextLabels = nextProps.labels

        if (labels !== nextLabels)
        {
            if (JSON.stringify(labels) !== JSON.stringify(nextLabels))
            {
                this.setState({notes: undefined})
                this._fetch(nextLabels)
            }
        }
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