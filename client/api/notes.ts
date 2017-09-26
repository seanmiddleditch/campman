import {RPCHelper} from './helpers'
import {Note} from '../types'

export class NotesAPI
{
    private _rpc = new RPCHelper();

    fetchAll(options: {labels?: string|string[]}) : Promise<Note[]>
    {
        return this._rpc.get<Note[]>('/api/notes', {label: options.labels});
    }

    fetch(slug: string) : Promise<Note>
    {
        return this._rpc.get<Note>('/api/notes/' + slug);
    }

    delete(slug: string) : Promise<void>
    {
        return this._rpc.delete('/api/notes/' + slug);
    }

    update(slug: string, data: Note) : Promise<void>
    {
        return this._rpc.post('/api/notes/' + slug, {
            title: data.title,
            subtitle: data.subtitle,
            body: data.body,
            labels: data.labels
        });
    }
}

export const notes = new NotesAPI()