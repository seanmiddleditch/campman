import * as React from 'react'

import {MediaUploadDialog} from './media-upload-dialog'
import {MediaFile} from '../types'
import {MediaContent} from '../rpc/media-content'
import {Dialog} from './dialog'
import {ImageThumb} from './image-thumb'


function MediaList({media, selected, filter, onClick, onDoubleClick}: {media?: MediaFile[], selected?: MediaFile, filter: (f: MediaFile) => boolean, onClick: (e: React.MouseEvent<HTMLDivElement>, f: MediaFile) => void, onDoubleClick: (e: React.MouseEvent<HTMLDivElement>, f: MediaFile) => void})
{
    if (!media)
        return <div>No media available</div>
    const items = media.filter(f => filter(f)).map(file => (
        <div key={file.path} className='float-left m-2' style={{cursor: 'pointer', background: (selected && selected.path === file.path) ? '#EEE' : 'inherit'}}  onClick={ev => onClick(ev, file)} onDoubleClick={ev => onDoubleClick(ev, file)}>
            <ImageThumb className='rounded' size={200} hash={file.contentMD5} alt={file.caption} caption={file.caption || file.path}/>
        </div>
    ))
    if (items.length === 0)
        return <div>No matches</div>
    else
        return (
            <div>
                {items}
            </div>
        )
}

interface Props
{
    visible?: boolean
    path: string
    onSelect: (media: MediaFile) => void
    onCancel: () => void
    rpc: MediaContent
}
interface State
{
    uploadDialogOpen: boolean
    media?: MediaFile[]
    search?: string
    searchRegexes?: RegExp[]
    fetch?: Promise<void>
    error?: string
    selected?: MediaFile
}
export class MediaSelectDialog extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {
            uploadDialogOpen: false
        }
    }

    private _fetch(path: string)
    {
        if (!this.state.fetch)
        {
            const fetch = this.props.rpc.listFiles(path).then(media => {
                this.setState({media, error: undefined, fetch: undefined})
            }).catch(e => {
                this.setState({error: e.toString(), fetch: undefined})
            })
            this.setState({fetch})
        }
    }

    componentDidMount() {
        if (!this.state.media)
            this._fetch(this.props.path)
    }

    private _handleRefreshClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        ev.preventDefault()
        this._fetch(this.props.path)
    }

    private _handleSearchChange(ev: React.FormEvent<HTMLInputElement>)
    {
        ev.preventDefault()

        const search = ev.currentTarget.value
        const words = search.split(/\s+/).filter(s => s.length).sort()
        const searchRegexes = search.length ? words.map(w => new RegExp('\\b' + w, 'i')) : undefined

        this.setState({search, searchRegexes, selected: undefined})
    }

    private _handleUploadClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        ev.preventDefault()
        this.setState({uploadDialogOpen: true})
    }

    private _handleUploadClosed()
    {
        this.setState({uploadDialogOpen: false})
    }

    private _handleMediaUploaded(file: MediaFile)
    {
        this.setState({
            media: this.state.media.concat([file]),
            selected: file,
            uploadDialogOpen: false
        })
    }

    private _handleSelectItem(ev: React.MouseEvent<HTMLDivElement>, file: MediaFile)
    {
        ev.preventDefault()
        this.setState({selected: file})
    }

    private _handleCommitSelection(ev: React.MouseEvent<HTMLElement>, file: MediaFile)
    {
        ev.preventDefault()
        this.setState({selected: file})
        this.props.onSelect(file)
    }

    private _handleCancelClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        ev.preventDefault()
        this.props.onCancel()
    }

    private _filter(file: MediaFile)
    {
        if (this.state.searchRegexes)
        {
            for (const regex of this.state.searchRegexes)
                if ((file.caption && regex.test(file.caption)) || regex.test(file.path))
                    return true
            return false
        }
        return true
    }

    render()
    {
        return (
            <div>
                <MediaUploadDialog visible={this.state.uploadDialogOpen} rpc={this.props.rpc} onCancel={() => this._handleUploadClosed()} onUpload={file => this._handleMediaUploaded(file)}/>
                <Dialog visible={this.props.visible && !this.state.uploadDialogOpen}>
                    <div className='modal-body'>
                        <div className='input-group mb-2'>
                            <span className='input-group-append'>
                                <span className='input-group-text'><i className='fa fa-search'></i></span>
                            </span>
                            <input className='form-control' type='text' placeholder='search...' value={this.state.search} onChange={ev => this._handleSearchChange(ev)}/>
                            <span className='input-group-prepend'>
                                {(this.state.fetch ?
                                    <button disabled className='btn btn-outline-secondary disabled'><i className='fa fa-refresh fa-spin fa-fw'/></button> :
                                    <button className='btn btn-outline-secondary' onClick={ev => this._handleRefreshClicked(ev)}><i className='fa fa-refresh'/></button>
                                )}
                            </span>
                        </div>
                        {this.state.error && (<div className='input-groupz   mb-2'>
                            <span className='error text-danger'><i className='fa fa-exclamation-triangle'></i> {this.state.error}</span>
                        </div>)}
                        <div style={{maxHeight: '400px', overflowY: 'scroll'}}>
                            <div className='clearfix'/>
                            <MediaList media={this.state.media} selected={this.state.selected} filter={f => this._filter(f)} onClick={(e, f) => this._handleSelectItem(e, f)} onDoubleClick={(e, f) => this._handleCommitSelection(e, f)}/>
                        </div>
                    </div>
                    <div className='modal-footer'>
                        <button className='btn btn-info mr-auto' onClick={ev => this._handleUploadClicked(ev)}><i className='fa fa-upload'></i> Upload New Media</button>
                        <button className='btn btn-secondary' onClick={ev => this._handleCancelClicked(ev)}>Cancel</button>
                        <button className='btn btn-primary' disabled={!this.state.selected} onClick={ev => this._handleCommitSelection(ev, this.state.selected)}><i className='fa fa-plus'></i> Insert Media</button>
                    </div>
                </Dialog>
            </div>
        )
    }
}