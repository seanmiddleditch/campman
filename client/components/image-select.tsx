import * as React from 'react'

interface Props
{
    className?: string
    preview?: boolean
    disabled?: boolean
    onImageSelected: (result: {file: File, thumbnail: Blob}) => void
    onPathChanged?: (path: string) => void
}
interface State
{
    file?: File
    thumbnail?: Blob
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
        this.setState({path})
        this.props.onPathChanged(path)
    }

    private _onFileChanged(ev: React.ChangeEvent<HTMLInputElement>)
    {
        if (this.state.objectURL)
            URL.revokeObjectURL(this.state.objectURL)

        if (ev.target.files.length == 1)
        {
            const file = ev.target.files[0]
            this._generateThumbnail(file).then(thumbnail => {
                this.setState({
                    file,
                    thumbnail,
                    objectURL: URL.createObjectURL(file)
                })
                this.props.onImageSelected({file, thumbnail})
            })
        }
        else
        {
            this.setState({file: undefined, thumbnail: undefined, objectURL: undefined})
            this.props.onImageSelected({file: null, thumbnail: null})
        }

    }

    private async _generateThumbnail(file: File) : Promise<Blob>
    {
        const image = document.createElement('img')

        const {width, height} = await (async () => {
            const dataURL = URL.createObjectURL(file)
            try
            {
                // load into an image so we can extract the width and height
                image.src = dataURL
                await new Promise(resolve => image.onload = () => resolve())
                const width = image.width
                const height = image.height
                URL.revokeObjectURL(dataURL)

                return {width, height}
            }
            catch (e)
            {
                URL.revokeObjectURL(dataURL)
                throw e
            }
        })()

        // determine thumbnail size
        const targetMaxDimension = 200
        const {newWidth, newHeight} = (() => {
            if (width > height)
            {
                const newWidth = Math.min(targetMaxDimension, width)
                const newHeight = height * newWidth / width
                return {newWidth, newHeight}
            }
            else
            {
                const newHeight = Math.min(targetMaxDimension, height)
                const newWidth = width * newHeight / height
                return {newWidth, newHeight}
            }
        })()

        // if the thumbnail i sno smaller than the original, don't do anything else
        if (newWidth === width || newHeight === height)
            return file

        // scale down the image
        const canvas = document.createElement('canvas')
        canvas.width = newWidth
        canvas.height = newHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)

        // extract a PNG of the image
        const thumbnail = await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob)))
        return thumbnail
    }
}