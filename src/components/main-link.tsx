import * as React from 'react'
import { Link } from 'react-router-dom'
import { WithConfig } from './containers/with-config'
import * as urlJoin from 'url-join'

interface Props
{
    to: string
    className?: string
}

export const MainLink: React.SFC<Props> = ({to, className, children}) =>
    <WithConfig>{config => <a href={urlJoin(config.publicURL.toString(), to)} className={className}>{children}</a>}</WithConfig>