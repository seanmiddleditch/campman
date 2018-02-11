import * as React from 'react'

interface Props
{
    className?: string
    preview?: boolean
    disabled?: boolean
    onImageSelected: (file: File|null) => void
    onPathChanged?: (path: string) => void
    size?: number|string
    fallback?: () => any
    label?: boolean
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

    private _width()
    {
        if (typeof this.props.size === 'number')
            return `${this.props.size}px`
        else if (typeof this.props.size === 'string')
            return this.props.size
        else
            return '100%'
    }

    private _preview()
    {
        if (this.state.objectURL)
            return <img style={{maxWidth: this._width()}} className='img-responsive img-preview mb-2' src={this.state.objectURL}/>
        else if (this.props.fallback)
            return this.props.fallback()
        else
            return <div/>
    }

    public render()
    {
        const preview = this.props.preview === undefined || !!this.props.preview
        const nameEditable = !this.state.file || !!this.props.disabled || !this.props.onPathChanged
        const namePlaceholder = this.state.file ? `${this.state.file.name}` : 'please select a file'

        return (
            <div className={this.props.className}>
                {this._preview()}
                {this.props.label ? (
                    <label className='input-group'>
                        <div className='input-group-prepend'>
                            <div className='btn btn-secondary input-group-text'><i className='fa fa-file-image-o'></i>&nbsp;Select File</div>
                        </div>
                        <input type='file' className='d-none' onChange={ev => this._onFileChanged(ev)} disabled={!!this.props.disabled}/>
                        <input type='text' className='form-control' disabled={nameEditable} value={this.state.path} placeholder={namePlaceholder} onChange={ev => this._onPathChanged(ev)}/>
                    </label>
                ) : (
                    <label className='input-group'>
                        <input type='file' className='d-none' onChange={ev => this._onFileChanged(ev)} disabled={!!this.props.disabled}/>
                        <div className='btn btn-outline-secondary'><i className='fa fa-file-image-o'></i>&nbsp;Select File</div>
                    </label>
                )}
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
        this.setState({path}, () => this.props.onPathChanged && this.props.onPathChanged(path))
    }

    private _onFileChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        if (this.state.objectURL)
            URL.revokeObjectURL(this.state.objectURL)

        if (ev.target.files && ev.target.files.length == 1)
        {
            const file = ev.target.files[0]
            this.setState({
                file,
                objectURL: (this.props.preview === undefined || !!this.props.preview) ? URL.createObjectURL(file) : undefined
            }, () => this.props.onImageSelected(file))
        }
        else
        {
            this.setState({file: undefined, objectURL: undefined}, () => this.props.onImageSelected(null))
        }
    }
}