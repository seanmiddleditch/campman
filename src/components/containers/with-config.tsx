import * as React from 'react'
import { StateConsumer } from '../state-context'
import { APIConsumer } from '../api-context'
import { Config } from '../../state/config'

type Render = (config: Config) => React.ReactNode

type Props = {render: Render, children?: never}|{render?: never, children: Render}

type PropsWithState = Props&
{
    config: Config
}
class Container extends React.Component<PropsWithState>
{
    public render()
    {
        const {config, render, children} = this.props

        let result: React.ReactNode = undefined
        if (typeof render === 'function')
            result = render(config)
        else if (typeof children === 'function')
            result = children(config)
        else if (children)
            result = children

        return result || <div/>
    }
}

export const WithConfig: React.SFC<Props> = props => <StateConsumer>{({config}) => <Container config={config} {...props}/>}</StateConsumer>