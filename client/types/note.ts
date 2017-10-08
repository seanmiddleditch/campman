export interface Note
{
    readonly id?: number
    slug?: string
    title?: string
    subtitle?: string
    rawbody?: Object
    labels?: string[]
    visibility?: 'Public'|'Hidden',
    readonly editable?: boolean
}
