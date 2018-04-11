import * as React from 'react'
import { StateConsumer, SetState } from '../state-context'
import { APIConsumer } from '../api-context'
import { WikiPageData, CampaignData } from '../../types'
import { API } from '../../types'
import { Mapping } from '../../state'


type Render = (data: {pages?: WikiPageData[], error?: Error, fetching: boolean}) => React.ReactNode

type Props = {render: Render, children?: never}|{render?: never, children: Render}
type PropsWithAPI = Props&
{
    api: API
    campaign?: CampaignData
    pages?: Mapping<WikiPageData>
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
            this.props.api.listWikiPages({campaignId})
                .then(pages => {
                    this.props.setState(state => ({...state,
                        data: {...state.data, pages: pages.reduce((r, a) => ({...r, [a.id]: a}), {})},
                        indices: {...state.indices, pages: pages.map(a => a.id)}
                    }))
                })
                .catch(error => this.setState({error}))
        }
    }

    public render()
    {
        const {render, children, indices, pages} = this.props
        const {error} = this.state

        const fetching = !error && !indices

        const pageList = indices && pages &&
            indices.map(id => pages[id]).filter(adv => !!adv) as WikiPageData[]|undefined

        const renderProps = {pages: pageList, error, fetching}

        if (typeof render === 'function')
            return render(renderProps)
        else if (typeof children === 'function')
            return children(renderProps)
        else
            return children
    }
}

export const PagesContainer: React.SFC<Props> = props =>
    <StateConsumer>
        {({campaign, data, indices}, setState) =>
            <APIConsumer render={api =>
                <Container api={api} pages={data.pages} indices={indices.pages} campaign={campaign} setState={setState} {...props}/>
            }/>
        }
    </StateConsumer>