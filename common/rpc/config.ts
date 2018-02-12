export interface Config
{
    readonly publicURL: string
    readonly campaign?: {
        title: string
        url: string
    }
    readonly profile?: {
        nickname: string
        photoURL?: string
    }
}
