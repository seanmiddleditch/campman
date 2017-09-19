import * as React from 'react';

export default class MediaView extends React.Component<{}>
{
    refs: {
        image: HTMLImageElement
    };

    private _handleFileSelect(ev: React.ChangeEvent<HTMLInputElement>)
    {
        const file = ev.target.files[0];

        const filetype = file.type;
        const filesize = file.size;
        
        const img = this.refs.image;

        img.src = window.URL.createObjectURL(file);
        img.addEventListener('load', () => this._handleImageLoad(filetype, filesize));
    }

    private _handleImageLoad(filetype: string, filesize: number)
    {
        const img = this.refs.image;
        alert(img.width + 'x' + img.height + ' ' + filetype + ' ' + filesize);
    }

    render()
    {
        return <div>
                <img ref='image' style={{maxWidth: '100%'}}/>
                <input type='file' onChange={ev => this._handleFileSelect(ev)}/>
            </div>;
    }
}