import * as React from 'react'
import { StateConsumer, SetState } from '../state-context'
import { APIConsumer } from '../api-context'
import { CampaignData } from '../../types'
import { API } from '../../types'

type Render = (data: {campaigns?: CampaignData[], error?: Error, fetching: boolean}) => React.ReactNode

type Props = {render: Render, children?: never}|{render?: never, children: Render}
type PropsWithAPI = Props&{api: API, campaigns?: CampaignData[], setState: SetState}
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
        const {campaigns} = this.props
        if (!campaigns || campaigns.length === 0)
        {
            this.props.api.listCampaigns()
                .then(campaigns => {
                    this.setState({fetching: false})
                    this.props.setState(state => ({...state, campaigns: new Map<number, CampaignData>(campaigns.map(c => [c.id, c] as [number, CampaignData]))}))
                })
                .catch(error => this.setState({error, fetching: false}))
            this.setState({fetching: true})
        }
    }

    public render()
    {
        const {campaigns, render, children} = this.props
        const {fetching, error} = this.state

        const renderProps = {campaigns, error, fetching: fetching || false}

        if (typeof render === 'function')
            return render(renderProps)
        else if (typeof children === 'function')
            return children(renderProps)
        else
            return children
    }
}

export const CampaignsContainer: React.SFC<Props> = props =>
    <StateConsumer>
        {({data: {campaigns}}, setState) =>
            <APIConsumer render={api =>
                <Container api={api} campaigns={campaigns} setState={setState} {...props}/>
            }/>
        }
    </StateConsumer>