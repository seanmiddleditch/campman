import * as React from 'react';
import * as JQuery from 'jquery';
import {Link} from 'react-router-dom';
import * as api from '../../api';
import * as path from 'path';

import Page, {PageHeader, PageBody} from '../../components/page'
import FilesFoldersList from './components/files-folders-list'

export interface MediaBrowserPageProps
{
    path?: string;
}
interface MediaBrowserPageState
{
    uploading: boolean;
};
export default class MediaBrowserPage extends React.Component<MediaBrowserPageProps, MediaBrowserPageState>
{
    refs: {
        file: HTMLInputElement,
        image: HTMLImageElement,
        modal: HTMLDivElement
    };

    constructor(props: MediaBrowserPageProps)
    {
        super(props);
        this.state = {
            uploading: false
        };
    }

    private _startUpload(file: File)
    {
        if (!this.state.uploading)
        {
            this.setState({uploading: true});
            api.media.upload(file).then(url => {
                this.setState({uploading: false});
                (JQuery(this.refs.modal) as any).modal('hide');
                this.forceUpdate()
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

    render()
    {
        return (
            <Page>
                <PageHeader icon='picture-o' title='Media Browser'/>
                <PageBody>
                    <FilesFoldersList path={this.props.path}>
                        <div className='list-group-item'>
                            <button className='btn btn-default' data-toggle='modal' data-target='#new-file-dialog'>
                                <i className='fa fa-plus'></i> Upload New File
                            </button>
                        </div>
                    </FilesFoldersList>
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
                </PageBody>
            </Page>
        )
    }
}