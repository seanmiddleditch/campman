import {config} from '../config'
import {URL} from 'url'

export function json(context: any)
{
    return JSON.stringify(context)
}

export function image_url(params: {hash: {hash: string|undefined, ext: string|undefined}})
{
    const hash = params.hash.hash || ''
    const ext = params.hash.ext || 'jpg'
    const url = new URL(`/img/full/${hash}.${ext}`, config.publicURL)
    url.hostname = `media.${url.hostname}`
    return url.toString()
}

export function thumb_url(params: {hash: {hash: string|undefined, size: number|undefined}})
{
    const hash = params.hash.hash || ''
    const size = params.hash.size || 100
    const url = new URL(`/img/thumb/${size}/${hash}.png`, config.publicURL)
    url.hostname = `media.${url.hostname}`
    return url.toString()
}