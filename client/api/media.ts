import {RPCHelper} from './helpers';

export class MediaAPI
{
    private _rpc = new RPCHelper();

    presign(params: {filename: string, filetype: string, filesize: number})
    {
        return this._rpc.post<{signedRequest: string, putURL: string}>('/api/media/presign', params);
    }

    async upload(file: File) : Promise<URL>
    {
        const filename = file.name;
        const filetype = file.type;
        const filesize = file.size;

        const signed = await this.presign({filename, filetype, filesize});
        const put = await fetch(signed.signedRequest, {method: 'put', mode: 'cors', body: file});
        
        return new URL(signed.putURL);
    }
};

export const media = new MediaAPI();