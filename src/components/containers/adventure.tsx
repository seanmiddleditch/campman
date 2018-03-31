import * as React from 'react'
import { StateConsumer, SetState } from '../state-context'
import { APIConsumer } from '../api-context'
import { AdventureData, AdventureInput, CampaignData } from '../../types'
import { API } from '../../types'
import { Mapping } from '../../state'

type RenderFuncProps =
{
    adventure?: AdventureData
    error?: Error
    fetching: boolean
    update: (adv: AdventureInput) => Promise<void>
    delete: () => Promise<void>
}

type Render = (props: RenderFuncProps) => React.ReactNode
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

    private _update(adventure: AdventureInput): Promise<void>
    {
        const {id, campaign} = this.props
        const campaignId = campaign ? campaign.id : 0

        return this.props.api.updateAdventure({campaignId, adventure: {...adventure, id}})
            .then(adv => {
                this.props.setState(state => ({...state,
                    data: {...state.data, adventures: {...state.data.adventures, [id]: adv}}
                }))
            })
            .catch(error => {
                this.setState({error})
            })
    }

    private _delete(): Promise<void>
    {
        const {id, campaign} = this.props
        const campaignId = campaign ? campaign.id : 0

        return this.props.api.deleteAdventure({campaignId, adventureId: id})
            .then(adv => {
                this.props.setState(state => ({...state,
                    data: {...state.data, adventures: {...state.data.adventures, [id]: undefined}},
                    indices: {...state.indices, adventures: undefined}
                }))
            })
            .catch(error => {
                this.setState({error})
            })
    }

    public render()
    {
        const {render, children, id, adventures} = this.props
        const {fetching, error} = this.state

        const adventure = adventures && adventures[id]

        const renderProps = {adventure, error, fetching: fetching || false, update: this._update.bind(this), delete: this._delete.bind(this)}

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