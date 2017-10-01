import {RPCHelper} from './helpers'
import MediaFile from '../types/media-file'

export class MediaAPI
{
    private _rpc = new RPCHelper()

    presign(params: {filename: string, filetype: string, filesize: number, caption: string})
    {
        return this._rpc.post<{signedRequest: string, url: string}>('/api/media/presign', params)
    }

    async upload(data: {file: File, caption: string}) : Promise<URL>
    {
        const filename = data.file.name
        const filetype = data.file.type
        const filesize = data.file.size
        const {caption} = data

        const signed = await this.presign({filename, filetype, filesize, caption})
        const put = await fetch(signed.signedRequest, {method: 'put', mode: 'cors', body: data.file})

        return new URL(signed.url)
    }

    async list(path: string = '')
    {
        return this._rpc.get<MediaFile[]>('/api/media/list/' + path)
    }
}

export const media = new MediaAPI()