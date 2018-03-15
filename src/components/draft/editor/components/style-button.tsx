import * as React from 'react'

interface Props
{
    active: boolean
    onToggle: () => void
}
export const StyleButton: React.SFC<Props> = ({active, onToggle, children}) =>
    <button className={`btn btn-secondary ${active && 'active'}`} onMouseDown={ev => {ev.preventDefault(); ev.stopPropagation(); onToggle()}}>{children}</button>
