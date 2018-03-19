import * as React from 'react'
import { StateConsumer, SetState } from '../state-context'
import { APIConsumer } from '../api-context'
import { CampaignData } from '../../types'
import { API } from '../../types'
import { State } from '../../state'
import { StateEnteredEventDetails } from 'aws-sdk/clients/stepfunctions';

interface Props
{
    render?: (campaigns: CampaignData[]) => React.ReactNode
    loading?: () => React.ReactNode
    failed?: (err: Error) => React.ReactNode
}

interface PropsWithAPI extends Props
{
    api: API
    state: State
    setState: SetState
}
interface ContainerState
{
    campaigns: CampaignData[]
    fetching?: boolean
    error?: Error
}
class Container extends React.Component<PropsWithAPI, ContainerState>
{
    constructor(props: PropsWithAPI)
    {
        super(props)
        this.state = {
            campaigns: Array.from(this.props.state.campaigns.values())
        }
    }

    public componentDidMount()
    {
        if (this.state.campaigns.length === 0)
        {
            this.props.api.listCampaigns()
                .then(campaigns => {
                    this.setState({campaigns, fetching: false})
                    this.props.setState(state => ({...state, campaigns: new Map<number, CampaignData>(campaigns.map(c => [c.id, c] as [number, CampaignData]))}))
                })
                .catch(error => this.setState({error, fetching: false}))
            this.setState({fetching: true})
        }
    }

    public render()
    {
        if (this.state.fetching)
            return this.props.loading ? this.props.loading() : (this.props.children || <div>Loading...</div>)
        else if (this.state.error)
            return this.props.failed ? this.props.failed(this.state.error) : (this.props.children || <div>{this.state.error.message}</div>)
        else if (this.state.campaigns)
            return this.props.render ? this.props.render(this.state.campaigns) : (this.props.children || <div/>)
        else
            return this.props.children
    }
}

export const CampaignsContainer: React.SFC<Props> = props => <StateConsumer render={(state, setState) => <APIConsumer render={api => <Container api={api} state={state} setState={setState} {...props}/>}/>}/>