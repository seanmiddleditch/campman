export interface Config
{
    readonly publicURL: URL
    readonly campaign?: {
        title: string
        url: URL
    }
    readonly profile?: {
        nickname: string
        photoURL?: URL
    }
}
