import * as React from 'react'

import * as api from '../../api'
import {MediaFile} from '../../types/media-file'

import {Modal, ModalHeader, ModalBody} from '../modal'
import {UploadDialog} from './components/upload-dialog'

interface MediaSelectorProps
{
    visible?: boolean
    path?: string
    onSelect: (file: MediaFile) => void
    onCancel: () => void
}
interface MediaSelectorState
{
    media?: MediaFile[]
    search?: string
    searchRegexes?: RegExp[]
    uploading?: boolean
    dialogOpen?: boolean
    fetching?: boolean
}
export class MediaSelector extends React.Component<MediaSelectorProps, MediaSelectorState>
{
    private _fetching = false

    constructor(props: MediaSelectorProps)
    {
        super(props)
        this.state = {}
    }

    private _fetch(path: string)
    {
        if (!this._fetching)
        {
            this._fetching = true
            api.media.list(path)
                .then(media => {
                    this._fetching = false
                    this.setState({media})
                    if (this.props.visible && media.length === 0)
                        this.setState({dialogOpen: true})
                })
                .catch(err => {
                    this._fetching = false
                    console.log(err, err.stack)
                    this.setState({media: []})
                })
        }
    }

    componentWillReceiveProps(nextProps: MediaSelectorProps)
    {
        if (nextProps.visible)
        {
            if (this.props.path !== nextProps.path)
            {
                this.setState({media: undefined})
            }

            if (this.state.media === undefined)
            {
                this._fetch(nextProps.path);    
            }
            else if (this.state.media.length === 0)
            {
                this.setState({dialogOpen: true})
            }
        }
    }

    private _handleSearchChange(ev: React.FormEvent<HTMLInputElement>)
    {
        const search = ev.currentTarget.value
        const words = search.split(/\s+/).filter(s => s.length).sort()
        const searchRegexes = search.length ? words.map(w => new RegExp('\\b' + w, 'i')) : undefined

        this.setState({search, searchRegexes})
        ev.stopPropagation()
    }

    private _filter(media: MediaFile)
    {
        if (this.state.searchRegexes)
        {
            for (const regex of this.state.searchRegexes)
                if (!regex.test(media.caption))
                    return false
        }
        return true
    }

    private _startUpload(data: {file: File, caption: string})
    {
        if (!this.state.uploading)
        {
            this.setState({uploading: true})
            api.media.upload(data).then(media => {
                this.setState({uploading: false, dialogOpen: false})
                this.state.media.push(media)
                this.props.onSelect(media)
            }).catch(e => this.setState({uploading: false}))
        }
    }

    render()
    {
        return (
            <div>
                <UploadDialog visible={this.state.dialogOpen} disabled={this.state.uploading} onClose={() => this.setState({dialogOpen: false})} onUpload={file => this._startUpload(file)}/>
                <Modal visible={this.props.visible && !this.state.dialogOpen && !this._fetching} backdrop='visible' onClose={this.props.onCancel}>
                    <ModalBody>
                        <div className='input-group mb-2'>
                            <input className='form-control' type='text' placeholder='search...' value={this.state.search} onChange={ev => this._handleSearchChange(ev)}/>
                            <span className='input-group-addon'><i className='fa fa-search'></i></span>
                        </div>
                        <div className='list-group'>
                            {this.state.media && this.state.media.filter(f => this._filter(f)).map(file => (
                                <div key={file.url} className='list-group-item' style={{cursor: 'pointer'}} onClick={() => !this.state.dialogOpen && this.props.onSelect(file)}>
                                    <figure className='figure'>
                                        <img src={file.url} className='figure-img img-fluid rounded img-thumbnail' style={{width: '100px'}} alt={file.caption}/>
                                        <figcaption className='figure-caption'>{file.caption || file.path}</figcaption>
                                    </figure>
                                </div>
                            ))}
                        </div>
                        <div className='mt-2'>
                            <div className='float-right'>
                                <button className='btn btn-secondary mr-2' onClick={this.props.onCancel}>Cancel</button>
                                <button className='btn btn-secondary' onClick={() => this.setState({dialogOpen: true})}><i className='fa fa-plus'></i> Upload New Media</button>
                            </div>
                        </div>
                    </ModalBody>
                </Modal>
            </div>
        )
    }
}