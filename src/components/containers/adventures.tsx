import * as React from 'react'
import { StateConsumer, SetState } from '../state-context'
import { APIConsumer } from '../api-context'
import { AdventureData, CampaignData } from '../../types'
import { API } from '../../types'

type Render = (data: {adventures?: AdventureData[], error?: Error, fetching: boolean}) => React.ReactNode

type Props = {render: Render, children?: never}|{render?: never, children: Render}
type PropsWithAPI = Props&{api: API, campaign?: CampaignData, adventures?: AdventureData[], setState: SetState}
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
        const {adventures, campaign} = this.props
        const campaignId = campaign ? campaign.id : 0
        if (!adventures || adventures.length === 0)
        {
            this.props.api.listAdventures({campaignId})
                .then(adventures => {
                    this.setState({fetching: false})
                    this.props.setState(state => ({...state, data: {...state.data, adventures}}))
                })
                .catch(error => this.setState({error, fetching: false}))
            this.setState({fetching: true})
        }
    }

    public render()
    {
        const {adventures, render, children} = this.props
        const {fetching, error} = this.state

        const renderProps = {adventures, error, fetching: fetching || false}

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
        {({campaign, data: {adventures}}, setState) =>
            <APIConsumer render={api =>
                <Container api={api} adventures={adventures} campaign={campaign} setState={setState} {...props}/>
            }/>
        }
    </StateConsumer>