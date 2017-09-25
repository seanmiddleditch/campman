import * as React from 'react';
import {Link} from 'react-router-dom';

import * as api from '../../api/index'
import Page, {PageHeader, PageBody} from '../../components/page'
import Modal, {ModalHeader, ModalBody, ModalFooter} from '../../components/modal'

import LibrariesList from './components/libraries-list'
import NewLibraryDialog from './components/new-library-dialog'

export interface LibrariesViewProps
{
    config: {publicURL: string}
}
interface LibrariesViewState
{
    dialogOpen: boolean
    saving: boolean
}
export default class LibrariesView extends React.Component<LibrariesViewProps, LibrariesViewState>
{
    refs: {
        libraries: LibrariesList
        slug: HTMLInputElement
        title: HTMLInputElement
    }

    constructor()
    {
        super();
        this.state = {
            dialogOpen: false,
            saving: false
        };
    }

    private _createLibrary(library: {slug: string, title: string})
    {
        this.setState({saving: true});
        api.libraries.create(library)
            .then(() => this.setState({saving: false, dialogOpen: false}))
            .then(() => {
                const url = new URL('/', this.props.config.publicURL)
                url.hostname = `${library.slug}.${url.hostname}`;
                window.location.replace(url.toString())
            })
    }

    private _updateSlug(ev: React.ChangeEvent<HTMLInputElement>)
    {
        const title = ev.target.value.length ? ev.target.value : ev.target.placeholder;
        this.refs.slug.placeholder = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').slice(0, 32).trim().replace(/ /g, '-');
    }

    render()
    {
        return (
            <Page>
                <PageHeader icon='book' title='Libraries'/>
                <PageBody>
                    <NewLibraryDialog disabled={this.state.saving} visible={this.state.dialogOpen} onClose={() => this.setState({dialogOpen: false})} onCreate={library => this._createLibrary(library)}/>
                    <LibrariesList ref='libraries' publicURL={this.props.config.publicURL}>
                        <div className='list-group-item'>
                            <button className='btn btn-default' onClick={() => this.setState({dialogOpen: true})}>
                                <i className='fa fa-plus'></i> New Library
                            </button>
                        </div>
                    </LibrariesList>
                </PageBody>
            </Page>
        );
    }
}