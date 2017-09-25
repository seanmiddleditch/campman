import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as ReactRouter from 'react-router';
import {Link} from 'react-router-dom';
import * as api from '../../api';

import Page, {PageHeader, PageBody} from '../../components/page';
import NewNoteDialog from './components/new-note-dialog';
import NotesList from './components/notes-list';

interface ListNotesPageProps
{
    labels?: string|string[]
}
interface ListNotesPageState
{
    dialogOpen: boolean
    saving: boolean
}
export default class ListNotesPage extends React.Component<ListNotesPageProps, ListNotesPageState>
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
        return (
            <Page>
                <PageHeader icon='book' title='Notes'/>
                <PageBody>
                    <NewNoteDialog visible={this.state.dialogOpen} onClose={() => this.setState({dialogOpen: false})} onCreate={note => this._createNote(note)}/>
                    <NotesList labels={this.props.labels}>
                        <div className='list-group-item'>
                            <button className='btn btn-default'  onClick={() => this.setState({dialogOpen: true})}>
                                <i className='fa fa-plus'></i> New Note
                            </button>
                        </div>
                    </NotesList>
                </PageBody>
            </Page>
        )
    }
}