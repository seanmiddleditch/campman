import * as React from 'react'
import { StateConsumer, SetState } from '../state-context'
import { APIConsumer } from '../api-context'
import { AdventureData, CampaignData } from '../../types'
import { API } from '../../types'

type Render = (data: {adventure?: AdventureData, error?: Error, fetching: boolean}) => React.ReactNode
type RenderProps = {render: Render, children?: never}|{render?: never, children: Render}
type Props = {id: number}&RenderProps
type PropsWithAPI = Props&{api: API, campaign?: CampaignData, adventures?: AdventureData[], setState: SetState}

interface ContainerState
{
    fetching?: boolean
    error?: Error
}
class Container extends React.Component<PropsWithAPI, ContainerState>
{
    state: ContainerState = {}

    private _find(id: number)
    {
        const {adventures} = this.props
        if (adventures)
            return adventures.find(adv => adv.id === id)
        else
            return undefined
    }

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
        const {render, children, id} = this.props
        const adventure = this._find(id)
        const {fetching, error} = this.state

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