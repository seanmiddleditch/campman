import * as React from 'react'
import { StateConsumer, SetState } from '../state-context'
import { APIConsumer } from '../api-context'
import { AdventureData, CampaignData } from '../../types'
import { API } from '../../types'
import { Mapping } from '../../state'

type Render = (data: {adventure?: AdventureData, error?: Error, fetching: boolean}) => React.ReactNode
type RenderProps = {render: Render, children?: never}|{render?: never, children: Render}
type Props = {id: number}&RenderProps
type PropsWithAPI = Props&
{
    api: API
    campaign?: CampaignData
    adventures?: Mapping<AdventureData>
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
        const {id, adventures, campaign} = this.props
        const campaignId = campaign ? campaign.id : 0

        const adventure = adventures && adventures[id]

        if (!adventure)
        {
            this.props.api.fetchAdventure({campaignId, adventureId: id})
                .then(adventure => {
                    this.setState({fetching: false})
                    this.props.setState(state => ({...state,
                        data: {...state.data, adventures: {...state.data.adventures, [id]: adventure}}
                    }))
                })
                .catch(error => this.setState({error, fetching: false}))
            this.setState({fetching: true})
        }
    }

    public render()
    {
        const {render, children, id, adventures} = this.props
        const {fetching, error} = this.state

        const adventure = adventures && adventures[id]

        const renderProps = {adventure, error, fetching: fetching || false}

        let result: React.ReactNode = undefined
        if (typeof render === 'function')
            result = render(renderProps)
        else if (typeof children === 'function')
            result = children(renderProps)
        else
            result = children

        return result || null
    }
}

export const AdventureContainer: React.SFC<Props> = props =>
    <StateConsumer>
        {({campaign, data: {adventures}}, setState) =>
            <APIConsumer render={api =>
                <Container api={api} adventures={adventures} campaign={campaign} setState={setState} {...props}/>
            }/>
        }
    </StateConsumer>