import {RPCHelper} from './helpers'
import {Note} from '../types'

export class MapsAPI
{
    private _rpc = new RPCHelper();

    fetchAll(options: {labels?: string|string[]}) : Promise<Note[]>
    {
        return this._rpc.get<Note[]>('/api/maps', {label: options.labels});
    }

    fetch(slug: string) : Promise<Note>
    {
        return this._rpc.get<Note>('/api/maps/' + slug);
    }
}

export const notes = new MapsAPI()