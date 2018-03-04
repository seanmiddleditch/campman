import * as React from 'react'
import {API} from '../../types'
import {ImageThumb} from '../image-thumb'
import {MediaUploadDialog} from '../media-upload-dialog'
import {APIConsumer} from '../api'

interface Props
{
    files: any[]
    canUpload?: boolean
    canDelete?: boolean
}
interface State
{
    uploadDialog: boolean
}
export class ListFiles extends React.Component<Props, State>
{
    state = {
        uploadDialog: false
    }

    private _handleUploadClicked()
    {
        this.setState({uploadDialog: true})
    }

    private _handleDeleteClicked(path: string, api: API)
    {
        if (confirm('Are you sure you want to delete this file?'))
            api.deleteFile(path)
                .then(() => window.location.reload(true))
                .catch(err => alert(err))
    }

    public render()
    {
        return <APIConsumer render={api => <div>
            <MediaUploadDialog visible={!!this.state.uploadDialog} onCancel={() => this.setState({uploadDialog: false})} onUpload={() => document.location.reload(true)}/>
            {!!this.props.canUpload && <button className='btn btn-primary' onClick={() => this._handleUploadClicked()}><i className='fa fa-upload'></i> Upload</button>}
            <div className='clearfix'>
                {this.props.files.map(file => (
                    <div key={file.path} className='card float-left m-2' style={{width: '12rem', height: '16rem'}}>
                        <div style={{height: '140px', overflow: 'hidden'}}><a href='{{image_url hash=this.contentMD5 ext=this.extension}}'><ImageThumb hash={file.contentMD5} size={200}/></a></div>
                        <div className='card-body'>
                            <h5 className='card-title'>{file.caption ? file.caption : file.path}</h5>
                            <a href={file.url} className='btn btn-link'><i className='fa fa-search-plus'></i></a>
                            <button disabled className='btn btn-link'><i className='fa fa-pencil'></i></button>
                            {!!this.props.canDelete && <button disabled={!!this.state.uploadDialog} className='btn btn-link pull-right' onClick={() => this._handleDeleteClicked(file.path, api)}><i className='fa fa-trash-o'></i></button>}
                        </div>
                    </div>
                ))}
            </div>
            {!this.props.files && <div className='alert alert-warning'>No results</div>}
        </div>}/>
    }
}