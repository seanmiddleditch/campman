import * as React from 'react'
import {MediaUploadDialog} from './media-upload-dialog'
import {MediaFile} from '../types'
import {API} from '../types'
import {Config} from '../state/config'
import {Dialog} from './dialog'
import {ImageThumb} from './image-thumb'
import {APIConsumer} from './api-context'
import {StateConsumer} from './state-context'

function MediaList({media, selected, filter, onClick, onDoubleClick, loading}: {media?: MediaFile[], selected?: MediaFile, loading: boolean, filter: (f: MediaFile) => boolean, onClick: (e: React.MouseEvent<HTMLDivElement>, f: MediaFile) => void, onDoubleClick: (e: React.MouseEvent<HTMLDivElement>, f: MediaFile) => void})
{
    if (!media)
        media = []

    const items = media.filter(f => filter(f)).map(file => (
        <div key={file.path} className='float-left m-2' style={{cursor: 'pointer', background: (selected && selected.path === file.path) ? '#EEE' : 'inherit'}}  onClick={ev => onClick(ev, file)} onDoubleClick={ev => onDoubleClick(ev, file)}>
            <ImageThumb className='rounded' size={200} hash={file.contentMD5} alt={file.caption} caption={file.caption || file.path}/>
        </div>
    ))

    if (items.length === 0 && !loading)
        return <div>No {filter ? 'matches' : 'available media'}</div>
    else if (items.length === 0 && loading)
        return <i className='fa fa-spinner fa-spin fa-3x'></i>
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
}

interface PropsWithAPI extends Props
{
    api: API
    config: Config
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
class MediaSelect extends React.Component<PropsWithAPI, State>
{
    constructor(props: PropsWithAPI)
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
            const {campaign} = this.props.config
            const fetch = this.props.api.listFiles({campaignId: campaign ? campaign.id : 0, path}).then(files => {
                this.setState({media: files, error: undefined, fetch: undefined})
            }).catch((e: Error) => {
                this.setState({error: e.message, fetch: undefined})
            })
            this.setState({fetch})
        }
    }

    componentDidMount()
    {
        if (!this.state.media && this.props.visible)
            this._fetch(this.props.path)
    }

    componentWillReceiveProps(nextProps: Props)
    {
        if (!this.state.media && nextProps.visible)
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
            media: this.state.media ? this.state.media.concat([file]) : [file],
            selected: file,
            uploadDialogOpen: false
        })
    }

    private _handleSelectItem(ev: React.MouseEvent<HTMLDivElement>, file: MediaFile)
    {
        ev.preventDefault()
        this.setState({selected: file})
    }

    private _handleSelectAndCommit(ev: React.MouseEvent<HTMLDivElement>, file: MediaFile)
    {
        ev.preventDefault()
        this.setState({selected: file}, () => this.props.onSelect(file))
    }

    private _handleCommitSelection(ev: React.MouseEvent<HTMLElement>)
    {
        ev.preventDefault()
        if (this.state.selected)
            this.props.onSelect(this.state.selected)
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
                if ((file.caption && regex.test(file.caption)) || (file.path && regex.test(file.path)))
                    return true
            return false
        }
        return true
    }

    render()
    {
        return (
            <div>
                <MediaUploadDialog visible={this.state.uploadDialogOpen} onCancel={() => this._handleUploadClosed()} onUpload={file => this._handleMediaUploaded(file)}/>
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
                            <MediaList loading={!!this.state.fetch} media={this.state.media} selected={this.state.selected} filter={f => this._filter(f)} onClick={(e, f) => this._handleSelectItem(e, f)} onDoubleClick={(e, f) => this._handleSelectAndCommit(e, f)}/>
                        </div>
                    </div>
                    <div className='modal-footer'>
                        <button className='btn btn-info mr-auto' onClick={ev => this._handleUploadClicked(ev)}><i className='fa fa-upload'></i> Upload New Media</button>
                        <button className='btn btn-secondary' onClick={ev => this._handleCancelClicked(ev)}>Cancel</button>
                        <button className='btn btn-primary' disabled={!this.state.selected} onClick={ev => this._handleCommitSelection(ev)}><i className='fa fa-plus'></i> Insert Media</button>
                    </div>
                </Dialog>
            </div>
        )
    }
}

export const MediaSelectDialog = (props: Props) => <StateConsumer render={state => <APIConsumer render={api => <MediaSelect api={api} config={state.config} {...props}/>}/>}/>