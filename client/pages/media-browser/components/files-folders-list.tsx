import * as React from 'react'

import FolderItem from './folder-item'
import FileItem from './file-item'
import ImagePopup from './image-popup'

import * as api from '../../../api'

interface FilesFoldersListProps
{
    children?: any
    path?: string
}
interface FilesFoldersListState
{
    files?: string[]
    folders?: string[]
    viewing?: string
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
        .then(({files, folders}) => 
            this.setState({
                files,
                folders
            })
        )
        .catch(err => {
            console.log(err, err.stack);
            this.setState({files: [], folders: []});
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
            this.setState({files: undefined, folders: undefined});
            this._fetch(nextProps.path);    
        }
    }

    render()
    {
        return (
            <div className='list-group'>
                <ImagePopup url={this.state.viewing} onClose={() => this.setState({viewing: undefined})}/>
                {this.state.files === undefined ?
                    <div className='list-group-item'>loading...</div> :
                    Array.prototype.concat(
                        (this.props.path && this.props.path !== '/') ? [<FolderItem path='..'/>] : [],
                        this.state.folders.map(folder => <FolderItem path={folder}/>),
                        this.state.files.map(file => <FileItem url={file} onClick={() => this.setState({viewing: file})}/>)
                    )
                }
                {this.props.children}
            </div>
        )
    }
}