import * as React from 'react'

import * as api from '../../api'
import MediaFile from '../../types/media-file'

import Modal, {ModalHeader, ModalBody} from '../modal'

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
}
export default class FilesFoldersList extends React.Component<MediaSelectorProps, MediaSelectorState>
{
    constructor(props: MediaSelectorProps)
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

    componentWillReceiveProps(nextProps: MediaSelectorProps)
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
            <Modal visible={this.props.visible} backdrop='visible' onClose={this.props.onCancel}>
                <ModalBody>
                    <div className='list-group'>
                        {this.state.media && this.state.media.map(file => (
                            <div key={file.url} className='list-group-item' style={{cursor: 'pointer'}} onClick={() => this.props.onSelect(file)}>
                                <figure className='figure'>
                                    <img src={file.url} className='figure-img img-fluid rounded img-thumbnail' style={{width: '100px'}} alt={file.caption}/>
                                    <figcaption className='figure-caption'>{file.caption || file.path}</figcaption>
                                </figure>
                            </div>
                        ))}
                    </div>
                </ModalBody>
            </Modal>
        )
    }
}