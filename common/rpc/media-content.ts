import {MediaFile} from '../types'

export interface MediaContent
{
    uploadFile({file, path, caption}: {file: File, path?: string, caption?: string}) : Promise<MediaFile>
    listFiles(path) : Promise<MediaFile[]>
    deleteFile(path: string): Promise<void>
    getImageURL(hash: string, ext: string): string
    getThumbURL(hash: string, size: number): string
}