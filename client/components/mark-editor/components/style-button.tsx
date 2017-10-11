import * as React from 'react'

//ev.preventDefault() // draft-js bug https://github.com/facebook/draft-js/issues/696
export const StyleButton = (props: {active: boolean, onToggle: () => void, children: any}) => (
    <button className={'btn btn-secondary ' + (props.active ? 'active' : '')} onMouseDown={ev => {ev.preventDefault(); props.onToggle()}}>{props.children}</button>
)
