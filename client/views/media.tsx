import * as React from 'react';
import * as api from '../api/index';

class MediaViewState
{
    uploading: boolean;
    ready?: File;
};
export default class MediaView extends React.Component<{}, MediaViewState>
{
    refs: {
        image: HTMLImageElement
    };

    constructor()
    {
        super();
        this.state = {uploading: false};
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

    render()
    {
        return <div>
                <img ref='image' style={{maxWidth: '100%'}}/>
                <input type='file' onChange={ev => this._handleFileSelect(ev)}/>
            </div>;
    }
}