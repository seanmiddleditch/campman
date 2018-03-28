import * as React from 'react'
import { Link } from 'react-router-dom'

interface Props
{
    target: string
    offsetKey?: string
}
export const WikiLink: React.SFC<Props> = ({target, offsetKey, children}) =>
    <Link to={'/wiki/p/' + target} data-offset-key={offsetKey}>{children}</Link>