import * as React from 'react'
import { ImageLink } from '../image-link'
import { ImageThumb } from '../image-thumb'
import { MapData } from '../../types'
import { default as reactPanZoomHoc } from 'react-pan-and-zoom-hoc'

const Interactive = reactPanZoomHoc('div')

const clamp = (x: number, min: number, max: number) => Math.max(Math.min(x, max), min)
const toPercentage = (x: number) => clamp(Math.round(x * 100), 0, 100)

interface Props
{
    map: MapData
}
interface State
{
    x: number
    y: number
    scale: number
}
export class ViewMap extends React.Component<Props, State>
{
    state: State = {
        x: 0.5,
        y: 0.5,
        scale: 4
    }

    private _handlePanMove(x: number, y: number)
    {
        x = clamp(x, 0, 1)
        y = clamp(y, 0, 1)
        this.setState({x, y})
    }

    private _handlePanZoom(x: number, y: number, scale: number)
    {
        x = clamp(x, 0, 1)
        y = clamp(y, 0, 1)
        scale = clamp(scale, 0.5, 10)
        this.setState({x, y, scale})
    }

    public render()
    {
        const {map} = this.props
        const {x, y, scale} = this.state
        const [width, height] = [map.storage.imageWidth, map.storage.imageHeight]
        return <div>
            <Interactive
                x={x}
                y={y}
                scale={scale}
                scaleFactor={Math.sqrt(2)}
                minScale={0.5}
                maxScale={10}
                width={width}
                height={height}
                onPanMove={(x, y) => this._handlePanMove(x, y)}
                onPanAndZoom={(x, y, scale) => this._handlePanZoom(x, y, scale)}
                style={{width: '100%', height: '100%', border: '1px solid rgba(0, 0, 0, 0.3)', overflow: 'hidden', background: '1px solid rgba(0, 0, 0, 0.3)'}}
            >
                <img
                    src={`/media/img/full/${map.storage.contentMD5}.${map.storage.extension}`}
                    style={{transform: `scale(${scale}, ${scale}) translate(${(0.5 - x) * width}px, ${(0.5 - y) * height}px`}}
                    onDragStart={ev => ev.preventDefault()}
                    alt={map.title}/>
            </Interactive>
        </div>
    }
}