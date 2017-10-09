export interface Note
{
    readonly id?: number
    slug?: string
    title?: string
    subtitle?: string
    rawbody?: Object
    body?: string
    labels?: string[]
    visibility?: 'Public'|'Hidden',
    readonly editable?: boolean
}
