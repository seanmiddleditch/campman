import * as React from 'react'

interface Props
{
    className?: string
    preview?: boolean
    disabled?: boolean
    onImageSelected: (file: File) => void
    onPathChanged?: (path: string) => void
}
interface State
{
    file?: File
    objectURL?: string
    path?: string
}
export class ImageSelect extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {}
    }

    public render()
    {
        const preview = this.props.preview === undefined || !!this.props.preview
        const nameEditable = !this.state.file || !!this.props.disabled || !this.props.onPathChanged
        const namePlaceholder = this.state.file ? `${this.state.file.name}` : 'please select a file'

        return (
            <div className={this.props.className}>
                {preview && this.state.objectURL ? 
                    <img style={{maxWidth: '100%'}} className='img-responsive img-preview mb-2' src={this.state.objectURL}/> :
                    <div/>
                }
                <div className='input-group'>
                    <div className='input-group-prepend'>
                        <label htmlFor='media-upload-file' className='btn btn-secondary input-group-text'><i className='fa fa-file-image-o'></i>&nbsp;Select File</label>
                    </div>
                    <input id='media-upload-file' type='file' style={{display: 'none'}} onChange={ev => this._onFileChanged(ev)} disabled={!!this.props.disabled}/>
                    <input type='text' className='form-control' disabled={nameEditable} value={this.state.path} placeholder={namePlaceholder} onChange={ev => this._onPathChanged(ev)}/>
                </div>
            </div>
        )
    }
    
    componentWillUnmount()
    {
        if (this.state.objectURL)
            URL.revokeObjectURL(this.state.objectURL)
    }

    private _onPathChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        ev.preventDefault()
        const path = ev.target.value
        this.setState({path}, () => this.props.onPathChanged(path))
    }

    private _onFileChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        if (this.state.objectURL)
            URL.revokeObjectURL(this.state.objectURL)

        if (ev.target.files.length == 1)
        {
            const file = ev.target.files[0]
            this.setState({
                file,
                objectURL: URL.createObjectURL(file)
            }, () => this.props.onImageSelected(file))
        }
        else
        {
            this.setState({file: undefined, objectURL: undefined}, () => this.props.onImageSelected(null))
        }
    }
}