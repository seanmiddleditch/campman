import {RPCHelper} from './helpers';

export class NoteData
{
    id?: number;
    slug?: string;
    title?: string;
    subtitle?: string;
    body?: string;
    labels?: string[];
};

export class NotesAPI
{
    private _rpc = new RPCHelper();

    fetchAll() : Promise<NoteData[]>
    {
        return this._rpc.get<NoteData[]>('/api/notes');
    }

    fetch(slug: string) : Promise<NoteData>
    {
        return this._rpc.get<NoteData>('/api/notes/' + slug);
    }

    delete(slug: string) : Promise<void>
    {
        return this._rpc.delete('/api/notes/' + slug);
    }

    update(slug: string, data: NoteData) : Promise<void>
    {
        return this._rpc.post('/api/notes/' + slug, {
            title: data.title,
            subtitle: data.subtitle,
            body: data.body,
            labels: data.labels
        });
    }
};

export const notes = new NotesAPI();