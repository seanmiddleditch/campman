import * as React from 'react';
import * as JQuery from 'jquery';
import {Link} from 'react-router-dom';
import * as api from '../api/index';
import * as path from 'path';

export interface MediaViewProps
{
    path?: string;
}
interface MediaViewState
{
    uploading: boolean;
    files?: string[];
    folders?: string[];
};
export default class MediaView extends React.Component<MediaViewProps, MediaViewState>
{
    refs: {
        file: HTMLInputElement,
        image: HTMLImageElement,
        modal: HTMLDivElement
    };

    constructor(props: MediaViewProps)
    {
        super(props);
        this.state = {
            uploading: false
        };
    }

    private _fetch(path: string)
    {
        api.media.list(path).then(({files, folders}) => {
            this.setState({
                files,
                folders
            });
        });
    }

    private _startUpload(file: File)
    {
        if (!this.state.uploading)
        {
            this.setState({uploading: true});
            api.media.upload(file).then(url => {
                this.setState({uploading: false});
                (JQuery(this.refs.modal) as any).modal('hide');
                this._fetch(this.props.path);
            });
        }
    }

    private _handleFileSelect(ev: React.ChangeEvent<HTMLInputElement>)
    {
        const file = ev.target.files[0];
        const img = this.refs.image;
        img.src = window.URL.createObjectURL(file);
    }

    private _handleClick(ev: React.MouseEvent<HTMLButtonElement>)
    {
        const file = this.refs.file.files[0];
        alert(file);
        this._startUpload(file);
    }

    componentDidMount()
    {
        this._fetch(this.props.path);
    }

    componentWillReceiveProps(props: MediaViewProps)
    {
        if (this.props.path !== props.path)
        {
            this.setState({files: null, folders: null});
            this._fetch(props.path);
        }
    }

    private _renderMedia(url: string)
    {
        return <figure className='figure'>
                <img src={url} className='figure-img img-fluid rounded img-thumbnail' style={{width: '100px'}} alt={url}/>
                <figcaption className='figure-caption'>{url}</figcaption>
            </figure>
    }

    render()
    {
        const media = () => {
            if (this.state.files === undefined)
            {
                return <div>loading...</div>;
            }
            else
            {
                return (
                    <div className='list-group'>
                        {this.props.path && <div className='list-group-item'><Link to={path.normalize(this.props.path + '/..')}>..</Link></div>}
                        {this.state.folders && this.state.folders.map(f => <div className='list-group-item' key={f}><Link to={path.normalize('/media/' + (this.props.path || '') + '/' + f)}>{f}</Link></div>)}
                        {this.state.files && this.state.files.map(f => <div className='list-group-item' key={f}><a href={f}>{this._renderMedia(f)}</a></div>)}
                        <div className='list-group-item'>
                            <button className='btn btn-default' data-toggle='modal' data-target='#new-file-dialog'>
                                <i className='fa fa-plus'></i> Upload New File
                            </button>
                        </div>
                    </div>
                );
            }
        };

        return (
            <div>
                <div className='page-header'>
                    <h1><i className='fa fa-picture-o'></i> Media</h1>
                </div>
                {media()}
                <div ref='modal' className='modal' id='new-file-dialog' data-backdrop='static' role='dialog'>
                    <div className='modal-dialog' role='document'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                New Library
                            </div>
                            <div className='modal-body'>
                                <div className='form-group'>
                                    <img ref='image' style={{maxWidth: '100%'}}/>
                                </div>
                                <div className='form-group'>
                                    <label htmlFor='file'>File</label>
                                    <input ref='file' className='form-control' id='file' type='file' onChange={ev => this._handleFileSelect(ev)}/>
                                </div>
                            </div>
                            <div className='modal-footer'>
                                <button className='btn btn-secondary' data-dismiss='modal'>Cancel</button>
                                <button className='btn btn-primary' disabled={this.state.uploading} onClick={ev => this._handleClick(ev)}>Upload</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}