import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as ReactRouter from 'react-router';
import {Link} from 'react-router-dom';
import * as api from '../../api/index';

import Page, {PageHeader, PageBody} from '../../components/page';
import NewNoteDialog from './components/new-note-dialog';
import NoteItem from './components/note-item';

interface ListNotesPageState
{
    notes?: api.NoteData[]
    dialogOpen: boolean
    saving: boolean
}
export default class ListNotesPage extends React.Component<{}, ListNotesPageState>
{
    static contextTypes = { router: PropTypes.object.isRequired }
    
    context: ReactRouter.RouterChildContext<{}>

    constructor()
    {
        super();
        this.state = {
            dialogOpen: false,
            saving: false
        };
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

    private _createNote(note: {slug: string, title: string})
    {
        this.setState({saving: true})
        api.notes.update(note.slug, {title: note.title})
            .then(() => {
                this.setState({dialogOpen: false, saving: false})
                this.context.router.history.push(`/n/${note.slug}`);
            });
    }

    render()
    {
        const notes = () => (this.state.notes === undefined ?
            <div className='list-group-item'>loading...</div> :
            this.state.notes.map(n => <NoteItem note={n}/>))

        return (
            <Page>
                <PageHeader icon='book' title='Notes'/>
                <PageBody>
                    <NewNoteDialog visible={this.state.dialogOpen} onClose={() => this.setState({dialogOpen: false})} onCreate={note => this._createNote(note)}/>
                    <div className='list-group'>
                        {notes()}
                        <div className='list-group-item'>
                            <button className='btn btn-default'  onClick={() => this.setState({dialogOpen: true})}>
                                <i className='fa fa-plus'></i> New Note
                            </button>
                        </div>
                    </div>
                </PageBody>
            </Page>
        )
    }
}