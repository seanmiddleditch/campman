import * as React from 'react'
import { Link } from 'react-router-dom'

import * as api from '../../api'
import { Page, PageHeader, PageBody } from '../../components/page'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/modal'

import { LibrariesList } from './components/libraries-list'
import { NewLibraryDialog } from './components/new-library-dialog'

export interface ListLibrariesPageProps {
    config: { publicURL: string }
}
interface ListLibrariesPageState {
    dialogOpen: boolean
    saving: boolean
    error?: string
}
export class ListLibrariesPage extends React.Component<ListLibrariesPageProps, ListLibrariesPageState>
{
    refs: {
        libraries: LibrariesList
        slug: HTMLInputElement
        title: HTMLInputElement
    }

    constructor() {
        super()
        this.state = {
            dialogOpen: false,
            saving: false
        }
    }

    private _createLibrary(library: { slug: string, title: string }) {
        this.setState({ saving: true })
        api.libraries.create(library)
            .then(() => {
                this.setState({ saving: false, dialogOpen: false })
                const url = new URL('/', this.props.config.publicURL)
                url.hostname = `${library.slug}.${url.hostname}`
                window.location.replace(url.toString())
            })
            .catch(err => {
                console.error(err, err.stack)
                if (err.message)
                {
                    this.setState({ saving: false, error: err.message })
                }
            })
    }

    render() {
        return (
            <Page>
                <PageHeader icon='book' title='Libraries' />
                <PageBody>
                    {this.state.dialogOpen && (
                        <NewLibraryDialog disabled={this.state.saving} error={this.state.error} onClose={() => this.setState({ dialogOpen: false })} onCreate={library => this._createLibrary(library)} />
                    )}
                    <LibrariesList ref='libraries' publicURL={this.props.config.publicURL}>
                        <div className='list-group-item'>
                            <button className='btn btn-default' onClick={() => this.setState({ dialogOpen: true })}>
                                <i className='fa fa-plus'></i> New Library
                            </button>
                        </div>
                    </LibrariesList>
                </PageBody>
            </Page>
        )
    }
}