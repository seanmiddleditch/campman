import {config} from '../config'
import {URL} from 'url'
import {SafeString} from 'handlebars'
import {RenderReactString} from './react-ssr'
import * as components from '../../common/components'

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

export function react(params: {data: {root: any}, hash: any})
{
    const componentName = params.hash.component
    const component = (components as any)[componentName]
    return RenderReactString(component, params.data.root, params.hash)
}