import * as React from 'react'

import {Page, PageHeader, PageBody} from '../../components/page'

import * as api from '../../api'

enum Status
{
    Idle,
    Fetching,
    Saving
}

interface LibraryAdminPageProps
{
    slug: string
}
interface LibraryAdminPageState
{
    status: Status
    title: string
    visibility: 'Public'|'Hidden'
}
export class LibraryAdminPage extends React.Component<LibraryAdminPageProps, LibraryAdminPageState>
{
    constructor(props: LibraryAdminPageProps)
    {
        super(props)
        this.state = {
            status: Status.Idle,
            title: 'Test',
            visibility: 'Hidden'
        }
    }

    private _fetch()
    {
        if (this.state.status == Status.Idle)
        {
            this.setState({status: Status.Fetching})
            api.libraries.fetchSettings({slug: this.props.slug})
                .then(settings => this.setState({...settings, status: Status.Idle}))
        }
    }

    componentDidMount()
    {
        this._fetch()
    }

    private _handleTitleChanged(ev: React.FormEvent<HTMLInputElement>)
    {
        this.setState({title: ev.currentTarget.value})
    }

    private _handleVisibilityClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        this.setState({visibility: this.state.visibility === 'Public' ? 'Hidden' : 'Public'})
    }

    private _handleSaveClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        if (this.state.status === Status.Idle)
        {
            this.setState({status: Status.Saving})
            api.libraries.saveSettings({slug: this.props.slug, title: this.state.title, visibility: this.state.visibility})
                .then(() => this.setState({status: Status.Idle}))
                .catch(() => this.setState({status: Status.Idle}))
        }
    }

    public render()
    {
        return (
            <Page>
                <PageHeader icon='cog' title='Library Settings'/>
                <PageBody>
                    <div className='form-group mt-sm-2'>
                        <label htmlFor='title'>Title</label>
                        <input type='text' className='form-control' name='title' disabled={this.state.status !== Status.Idle} value={this.state.title} onChange={ev => this._handleTitleChanged(ev)}/>
                    </div>
                    <div className='form-group mt-sm-2'>
                        <label htmlFor='visbility'>Visibility</label>
                        <div className='btn-group form-control'>
                            {this.state.visibility === 'Public' && <button id='note-btn-visibility' className='btn btn-info' about='Toggle Visibility' disabled={this.state.status !== Status.Idle} onClick={ev => this._handleVisibilityClicked(ev)}>Public</button>}
                            {this.state.visibility !== 'Public' && <button id='note-btn-visibility' className='btn btn-light' about='Toggle Visibility' disabled={this.state.status !== Status.Idle} onClick={ev => this._handleVisibilityClicked(ev)}>Hidden</button>}
                        </div>
                    </div>
                    <div className='btn-group float-right mt-sm-2'>
                        <button className='btn btn-primary' disabled={this.state.status !== Status.Idle} onClick={ev => this._handleSaveClicked(ev)}>Save</button>
                    </div>
                </PageBody>
            </Page>
        )
    }
}