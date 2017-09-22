import * as React from 'react';
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
    ready?: File;
    files?: string[];
    folders?: string[];
};
export default class MediaView extends React.Component<MediaViewProps, MediaViewState>
{
    refs: {
        image: HTMLImageElement
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
        if (this.state.uploading)
        {
            this.setState({ready: file});
        }
        else
        {
            const img = this.refs.image;
            img.src = window.URL.createObjectURL(file);

            this.setState({uploading: true});
            api.media.upload(file).then(url => {
                this.setState({uploading: false});
                if (this.state.ready)
                {
                    const file = this.state.ready;
                    this.setState({ready: undefined});
                    this._startUpload(file);
                }
            });
        }
    }

    private _handleFileSelect(ev: React.ChangeEvent<HTMLInputElement>)
    {
        const file = ev.target.files[0];
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
        return <div>
                <ul>
                    {this.props.path && <li><Link to={path.normalize(this.props.path + '/..')}>..</Link></li>}
                    {this.state.folders && this.state.folders.map(f => <li key={f}><Link to={path.normalize('/media/' + (this.props.path || '') + '/' + f)}>{f}</Link></li>)}
                </ul>
                {this.state.files && this.state.files.map(f => <a key={f} href={f}>{this._renderMedia(f)}</a>)}
                <div>
                    <img ref='image' style={{maxWidth: '100%'}}/>
                    <input type='file' onChange={ev => this._handleFileSelect(ev)}/>
                </div>
            </div>;
    }
}