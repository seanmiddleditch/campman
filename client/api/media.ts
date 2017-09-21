import {RPCHelper} from './helpers';

export interface ListResults
{
    files: string[];
    folders: string[];
}

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

    async list(path: string = '') : Promise<ListResults>
    {
        const results = await this._rpc.get<{folders: string[], files: {key: string, url: string}[]}>('/api/media/list/' + path);
        return {folders: results.folders, files: results.files.filter(f => f.key && f.key !== '').map(f => f.url)};
    }
};

export const media = new MediaAPI();