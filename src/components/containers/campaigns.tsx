import * as React from 'react'
import { StateConsumer, SetState } from '../state-context'
import { APIConsumer } from '../api-context'
import { CampaignData } from '../../types'
import { API } from '../../types'
import { Mapping } from '../../state'

type Render = (data: {campaigns?: CampaignData[], error?: Error, fetching: boolean}) => React.ReactNode

type Props = {render: Render, children?: never}|{render?: never, children: Render}
type PropsWithAPI = Props&
{
    api: API
    campaigns?: Mapping<CampaignData>
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
        const {indices} = this.props
        if (!indices || indices.length === 0)
        {
            this.props.api.listCampaigns()
                .then(campaigns => {
                    this.props.setState(state => ({...state,
                        data: {...state.data, campaigns: campaigns.reduce((r, c) => ({...r, [c.id]: c}), {})},
                        indices: {...state.indices, campaigns: campaigns.map(c => c.id)}
                    }))
                    this.setState({fetching: false})
                })
                .catch(error => this.setState({error, fetching: false}))
            this.setState({fetching: true})
        }
    }

    public render()
    {
        const {render, children, campaigns, indices} = this.props
        const {fetching, error} = this.state

        const campaignList = indices && campaigns &&
            indices.map(id => campaigns[id]).filter(c => !!c) as CampaignData[]|undefined

        const renderProps = {campaigns: campaignList, error, fetching: fetching || false}

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
        {({data, indices}, setState) =>
            <APIConsumer render={api =>
                <Container api={api} campaigns={data.campaigns} indices={indices.campaigns} setState={setState} {...props}/>
            }/>
        }
    </StateConsumer>