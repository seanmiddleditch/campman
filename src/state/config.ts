export interface Config
{
    readonly publicURL: URL
    readonly campaign?: {
        readonly id: number
        readonly title: string
        readonly url: URL
    }
}
