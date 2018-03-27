import * as React from 'react'
import { StateConsumer, SetState } from '../state-context'
import { APIConsumer } from '../api-context'
import { AdventureData, CampaignData } from '../../types'
import { API } from '../../types'
import { Mapping } from '../../state'


type Render = (data: {adventures?: AdventureData[], error?: Error, fetching: boolean}) => React.ReactNode

type Props = {render: Render, children?: never}|{render?: never, children: Render}
type PropsWithAPI = Props&
{
    api: API
    campaign?: CampaignData
    adventures?: Mapping<AdventureData>
    indices?: number[]
    setState: SetState
}
interface ContainerState
{
    fetching?: boolean
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
            this.props.api.listAdventures({campaignId})
                .then(adventures => {
                    this.props.setState(state => ({...state,
                        data: {...state.data, adventures: adventures.reduce((r, a) => ({...r, [a.id]: a}), {})},
                        indices: {...state.indices, adventures: adventures.map(a => a.id)}
                    }))
                    this.setState({fetching: false})
                })
                .catch(error => this.setState({error, fetching: false}))
            this.setState({fetching: true})
        }
    }

    public render()
    {
        const {render, children, indices, adventures} = this.props
        const {fetching, error} = this.state

        const adventureList = indices && adventures &&
            indices.map(id => adventures[id]).filter(adv => !!adv) as AdventureData[]|undefined

        const renderProps = {adventures: adventureList, error, fetching: fetching || false}

        if (typeof render === 'function')
            return render(renderProps)
        else if (typeof children === 'function')
            return children(renderProps)
        else
            return children
    }
}

export const AdventuresContainer: React.SFC<Props> = props =>
    <StateConsumer>
        {({campaign, data, indices}, setState) =>
            <APIConsumer render={api =>
                <Container api={api} adventures={data.adventures} indices={indices.adventures} campaign={campaign} setState={setState} {...props}/>
            }/>
        }
    </StateConsumer>