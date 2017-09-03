import NoteSchema from './NoteSchema';

export default interface LabalSchema
{
    id?: number,
    slug: string,
    notes?: NoteSchema[]
}