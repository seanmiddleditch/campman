export default interface NoteSchema
{
    id?: number,
    slug: string,
    title: string,
    body: string,
    labels: string[]
}