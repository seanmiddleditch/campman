import {RPCHelper} from './helpers';

export class LabelData
{
    id?: number;
    slug?: string;
    numNotes?: number;
    notes?: {slug: string, title: string, subtitle: string}[];
};

export class LabelsAPI
{
    private _rpc = new RPCHelper();

    fetchAll() : Promise<LabelData[]>
    {
        return this._rpc.get<LabelData[]>('/api/labels');
    }

    fetch(slug: string) : Promise<LabelData>
    {
        return this._rpc.get<LabelData>('/api/labels/' + slug);
    }
};

export const labels = new LabelsAPI();