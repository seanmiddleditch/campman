import * as React from 'react'
import { StateConsumer, SetState } from '../state-context'
import { APIConsumer } from '../api-context'
import { CharacterData, CampaignData } from '../../types'
import { API } from '../../types'
import { Mapping } from '../../state'


type Render = (data: {characters?: CharacterData[], error?: Error, fetching: boolean}) => React.ReactNode

type Props = {render: Render, children?: never}|{render?: never, children: Render}
type PropsWithAPI = Props&
{
    api: API
    campaign?: CampaignData
    characters?: Mapping<CharacterData>
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
            this.props.api.listCharacters({campaignId})
                .then(characters => {
                    this.props.setState(state => ({...state,
                        data: {...state.data, characters: characters.reduce((r, a) => ({...r, [a.id]: a}), {})},
                        indices: {...state.indices, characters: characters.map(a => a.id)}
                    }))
                })
                .catch(error => this.setState({error}))
        }
    }

    public render()
    {
        const {render, children, indices, characters} = this.props
        const {error} = this.state

        const fetching = !error && !indices

        const characterList = indices && characters &&
            indices.map(id => characters[id]).filter(adv => !!adv) as CharacterData[]|undefined

        const renderProps = {characters: characterList, error, fetching}

        if (typeof render === 'function')
            return render(renderProps)
        else if (typeof children === 'function')
            return children(renderProps)
        else
            return children
    }
}

export const CharactersContainer: React.SFC<Props> = props =>
    <StateConsumer>
        {({campaign, data, indices}, setState) =>
            <APIConsumer render={api =>
                <Container api={api} characters={data.characters} indices={indices.characters} campaign={campaign} setState={setState} {...props}/>
            }/>
        }
    </StateConsumer>