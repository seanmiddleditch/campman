import * as React from 'react'
import * as ReactRouter from 'react-router'
import * as PropTypes from 'prop-types'

import * as api from '../../api'
import {Note} from '../../types'

import {Page, PageHeader, PageBody} from '../../components/page'

import {Labels} from './components/labels'
import {Subtitle} from './components/subtitle'
import {Bar} from './components/bar'
import {Body} from './components/body'

require('./styles/notes.css')

export interface ViewNotePageProps
{
    slug: string
};
interface ViewNotePageState
{
    failed: boolean
    note?: Note
};
export class ViewNotePage extends React.Component<ViewNotePageProps, ViewNotePageState>
{
    static contextTypes = { router: PropTypes.object.isRequired }
    
    context: ReactRouter.RouterChildContext<ViewNotePageProps>

    constructor(props: ViewNotePageProps)
    {
        super(props)
        this.state = {
            failed: false
        }
    }

    private _onDelete()
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
            .then(note => this.setState({note}))
            .catch(err => {
                if (err.status == 404)
                    this._onEdit()
                else
                    this.setState({failed: true});
            });
    }

    private _onEdit()
    {
        const url = `/n/${this.props.slug}/edit`
        this.context.router.history.push(`/n/${this.props.slug}/edit`)
    }

    componentDidMount()
    {
        this._fetch()
    }

    componentWillReceiveProps(nextProps: ViewNotePageProps)
    {
        if (this.props.slug !== nextProps.slug)
        {
            this.setState({note: undefined, failed: false})
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
        const {note} = this.state

        if (note === undefined)
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
                        <Subtitle subtitle={note.subtitle}/>
                        <Labels labels={note.labels}/>
                        {this.state.note.editable && <Bar onEdit={() => this._onEdit()} onDelete={() => this._onDelete()}/>}
                        <Body rawbody={note.rawbody}/>
                    </PageBody>
                </Page>
            )
    }
}