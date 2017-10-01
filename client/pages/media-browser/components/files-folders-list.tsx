import * as React from 'react'

import FolderItem from './folder-item'
import FileItem from './file-item'
import ImagePopup from './image-popup'

import * as api from '../../../api'
import MediaFile from '../../../types/media-file'

interface FilesFoldersListProps
{
    children?: any
    path?: string
}
interface FilesFoldersListState
{
    media?: MediaFile[]
    viewing?: MediaFile
}
export default class FilesFoldersList extends React.Component<FilesFoldersListProps, FilesFoldersListState>
{
    constructor(props: FilesFoldersListProps)
    {
        super(props)
        this.state = {}
    }

    private _fetch(path: string)
    {
        api.media.list(path)
        .then(media => this.setState({media})
        )
        .catch(err => {
            console.log(err, err.stack);
            this.setState({media: []});
        })
    }

    componentDidMount()
    {  
        this._fetch(this.props.path);
    }

    componentWillReceiveProps(nextProps: FilesFoldersListProps)
    {
        if (this.props.path !== nextProps.path)
        {
            this.setState({media: undefined});
            this._fetch(nextProps.path);    
        }
    }

    render()
    {
        return (
            <div className='list-group'>
                <ImagePopup file={this.state.viewing} onClose={() => this.setState({viewing: undefined})}/>
                {this.state.media === undefined ?
                    <div className='list-group-item'>loading...</div> :
                    Array.prototype.concat(
                        (this.props.path && this.props.path !== '/') ? [<FolderItem path='..'/>] : [],
                        this.state.media.map(file => <FileItem file={file} onClick={file => this.setState({viewing: file})}/>)
                    )
                }
                {this.props.children}
            </div>
        )
    }
}