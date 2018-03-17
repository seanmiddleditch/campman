import * as React from 'react'

interface Props
{
    target: string
    offsetKey?: string
}
export const WikiLink: React.SFC<Props> = ({target, offsetKey, children}) =>
    <a href={'/wiki/p/' + target} data-offset-key={offsetKey}>{children}</a>