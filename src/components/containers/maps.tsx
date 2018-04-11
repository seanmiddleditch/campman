import * as React from 'react'
import { StateConsumer, SetState } from '../state-context'
import { APIConsumer } from '../api-context'
import { MapData, CampaignData } from '../../types'
import { API } from '../../types'
import { Mapping } from '../../state'


type Render = (data: {maps?: MapData[], error?: Error, fetching: boolean}) => React.ReactNode

type Props = {render: Render, children?: never}|{render?: never, children: Render}
type PropsWithAPI = Props&
{
    api: API
    campaign?: CampaignData
    maps?: Mapping<MapData>
    indices?: number[]
    setState: SetState
}
interface ContainerState
{
    error?: Error
}
class Container extends React.Component<PropsWithAPI, ContainerState>
{
    state: ContainerState = {}

    public componentDidMount()
    {
        const {indices, campaign} = this.props
        const campaignId = campaign ? campaign.id : 0
        if (!indices || indices.length === 0)
        {
            this.props.api.listMaps({campaignId})
                .then(maps => {
                    this.props.setState(state => ({...state,
                        data: {...state.data, maps: maps.reduce((r, a) => ({...r, [a.id]: a}), {})},
                        indices: {...state.indices, maps: maps.map(a => a.id)}
                    }))
                })
                .catch(error => this.setState({error}))
        }
    }

    public render()
    {
        const {render, children, indices, maps} = this.props
        const {error} = this.state

        const fetching = !error && !indices

        const mapList = indices && maps &&
            indices.map(id => maps[id]).filter(adv => !!adv) as MapData[]|undefined

        const renderProps = {maps: mapList, error, fetching}

        if (typeof render === 'function')
            return render(renderProps)
        else if (typeof children === 'function')
            return children(renderProps)
        else
            return children
    }
}

export const MapsContainer: React.SFC<Props> = props =>
    <StateConsumer>
        {({campaign, data, indices}, setState) =>
            <APIConsumer render={api =>
                <Container api={api} maps={data.maps} indices={indices.maps} campaign={campaign} setState={setState} {...props}/>
            }/>
        }
    </StateConsumer>