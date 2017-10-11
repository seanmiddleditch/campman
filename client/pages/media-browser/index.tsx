import * as React from 'react'
import {Link} from 'react-router-dom'
import * as api from '../../api'
import * as path from 'path'

import {Page, PageHeader, PageBody} from '../../components/page'
import {FilesFoldersList} from './components/files-folders-list'
import {UploadDialog} from './components/upload-dialog'

export interface MediaBrowserPageProps
{
    path?: string
}
interface MediaBrowserPageState
{
    uploading: boolean
    dialogOpen: boolean
};
export class MediaBrowserPage extends React.Component<MediaBrowserPageProps, MediaBrowserPageState>
{
    constructor(props: MediaBrowserPageProps)
    {
        super(props)
        this.state = {
            uploading: false,
            dialogOpen: false
        }
    }

    private _startUpload(data: {file: File, caption: string})
    {
        if (!this.state.uploading)
        {
            this.setState({uploading: true});
            api.media.upload(data).then(url => {
                this.setState({uploading: false, dialogOpen: false});
                this.forceUpdate()
            });
        }
    }

    render()
    {
        return (
            <Page>
                <PageHeader icon='picture-o' title='Media Browser'/>
                <PageBody>
                    <UploadDialog visible={this.state.dialogOpen} disabled={this.state.uploading} onClose={() => this.setState({dialogOpen: false})} onUpload={file => this._startUpload(file)}/>
                    <FilesFoldersList path={this.props.path}>
                        <div className='list-group-item'>
                            <button className='btn btn-default' onClick={() => this.setState({dialogOpen: true})}>
                                <i className='fa fa-plus'></i> Upload New File
                            </button>
                        </div>
                    </FilesFoldersList>
                </PageBody>
            </Page>
        )
    }
}