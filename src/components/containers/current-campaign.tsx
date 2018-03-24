import * as React from 'react'
import { StateConsumer } from '../state-context'
import { APIConsumer } from '../api-context'
import { CampaignData } from '../../types'

type Render = (campaign?: CampaignData) => React.ReactNode

type Props = {render: Render, children?: never}|{render?: never, children: Render}
type PropsWithState = Props&
{
    campaign?: CampaignData
}
class Container extends React.Component<PropsWithState>
{
    public render()
    {
        const {campaign, render, children} = this.props

        if (typeof render === 'function')
            return render(campaign)
        else if (typeof children === 'function')
            return children(campaign)
        else
            return <div/>
    }
}

export const CurrentCampaign: React.SFC<Props> = props => <StateConsumer>{({campaign}) => <Container campaign={campaign} {...props}/>}</StateConsumer>