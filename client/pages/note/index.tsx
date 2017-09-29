import * as React from 'react'
import * as ReactRouter from 'react-router'
import * as PropTypes from 'prop-types'

import * as api from '../../api'
import {Note} from '../../types'

import Page, {PageHeader, PageBody} from '../../components/page'

import NoteEditor from './components/note-editor'
import ViewNote from './components/view-note'

require('./styles/notes.css')

export interface NotePageProps
{
    slug: string
};
interface NotePageState
{
    editing: boolean
    failed: boolean
    saving: boolean
    note?: Note
};
export default class NotePage extends React.Component<NotePageProps, NotePageState>
{
    static contextTypes = { router: PropTypes.object.isRequired }
    
    context: ReactRouter.RouterChildContext<NotePageProps>

    constructor(props: NotePageProps)
    {
        super(props)
        this.state = {
            editing: false,
            saving: false,
            failed: false
        }
    }
    
    private _save(note: Note)
    {
        if (!this.state.saving)
        {
            this.setState({saving: true});

            api.notes.update(this.props.slug, note)
                .then(() => this.setState({saving: false, editing: true, note}))
                .catch((err: Error) => this.setState({saving: false}));
        }
    }

    private _delete()
    {
        if (confirm('This operation cannot be reversed! Click Cancel to keep this page.'))
        {
            api.notes.delete(this.props.slug)
                .then(() => this.context.router.history.push('/notes'));
        }
    }

    private _fetch()
    {
        api.notes.fetch(this.props.slug)
            .then(note => this.setState({note, editing: false}))
            .catch(err => {
                if (err.status == 404)
                    this.setState({
                        editing: true,
                        note: null
                    });
                else if (err.status == 401)
                    this.setState({failed: true});
            });
    }

    componentDidMount()
    {
        this._fetch()
    }

    componentWillReceiveProps(nextProps: NotePageProps)
    {
        if (this.props.slug !== nextProps.slug)
        {
            this.setState({note: undefined, editing: false, saving: false, failed: false})
        }
    }

    componentDidUpdate()
    {
        if (!this.state.note && !this.state.failed)
        {
            this._fetch()
        }
    }

    render()
    {
        if (this.state.note === undefined)
            return (
                <Page>
                    <PageHeader icon='file' title='Note'/>
                    <PageBody>loading...</PageBody>
                </Page>
            )
        else
            return (
                <Page>
                    <PageHeader icon='file' title={this.state.note ? this.state.note.title : 'Note'}/>
                    <PageBody>
                        {this.state.editing ?
                            <NoteEditor slug={this.props.slug} disabled={this.state.saving} note={this.state.note} onSave={note => this._save(note)} onCancel={() => this.setState({editing: false})}/> :
                            <ViewNote note={this.state.note} onEdit={() => this.setState({editing: true})} onDelete={() => this._delete()}/>
                        }
                    </PageBody>
                </Page>
            )
    }
}