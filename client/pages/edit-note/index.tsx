import * as React from 'react'
import * as ReactRouter from 'react-router'
import * as PropTypes from 'prop-types'

import * as api from '../../api'
import {Note} from '../../types'

import {Page, PageHeader, PageBody} from '../../components/page'

import {NoteEditor} from './components/note-editor'

require('./styles/notes.css')

export interface EditNotePageProps
{
    slug: string
}
interface EditNotePageState
{
    failed: boolean
    saving: boolean
    note?: Note
    error?: string
}
export class EditNotePage extends React.Component<EditNotePageProps, EditNotePageState>
{
    static contextTypes = { router: PropTypes.object.isRequired }
    
    context: ReactRouter.RouterChildContext<EditNotePageProps>

    constructor(props: EditNotePageProps)
    {
        super(props)
        this.state = {
            saving: false,
            failed: false
        }
    }
    
    private _save(note: Note)
    {
        if (!this.state.saving)
        {
            this.setState({saving: true})

            api.notes.update(this.props.slug, note)
                .then(() => this.setState({saving: false, note}))
                .catch((err: Error) => this.setState({saving: false}))
        }
    }

    private _delete()
    {
        if (confirm('This operation cannot be reversed! Click Cancel to keep this page.'))
        {
            api.notes.delete(this.props.slug)
                .then(() => this.context.router.history.push('/notes'))
        }
    }

    private _fetch()
    {
        api.notes.fetch(this.props.slug)
            .then(note => {
                if (note.editable)
                    this.setState({note, error: undefined})
                else
                    this.setState({failed: true, error: 'Note not editable'})
            })
            .catch(err => {
                if (err.status == 404)
                    this.setState({
                        note: {
                            labels: [],
                            title: '',
                            subtitle: '',
                            rawbody: ''
                        }
                    })
                else
                    this.setState({failed: true, error: err.message})
            })
    }

    private _onCancel()
    {
        this.context.router.history.push('/n/' + this.props.slug)
    }

    componentDidMount()
    {
        this._fetch()
    }

    componentWillReceiveProps(nextProps: EditNotePageProps)
    {
        if (this.props.slug !== nextProps.slug)
        {
            this.setState({note: undefined, saving: false, failed: false})
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
                    <PageBody>
                        {this.state.error && (
                            <div className='alert alert-danger' role='alert'>{this.state.error}</div>
                        )}
                        <NoteEditor slug={this.props.slug} disabled={this.state.saving} note={this.state.note} onSave={note => this._save(note)} onCancel={() => this._onCancel()}/>
                    </PageBody>
                </Page>
            )
    }
}