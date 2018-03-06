export interface Config
{
    readonly publicURL: URL
    readonly campaign?: {
        id: number
        title: string
        url: URL
    }
    readonly profile?: {
        nickname: string
        photoURL?: URL
    }
}
