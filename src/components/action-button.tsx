import * as React from 'react'

interface Action
{
    label: string
    color?: 'primary'|'danger'|'secondary'
    icon?: string
    onClick?: (ev: React.MouseEvent<HTMLButtonElement>) => void
}
type ActionSet = {[key: string]: Action}

type ActionKey<K extends string> = keyof K

const Label = (props: {icon?: string, label: string}) => props.icon ?
    <span><i className={`fa fa-fw fa-${props.icon}`}></i> {props.label}</span> :
    <span>{props.label}</span>


interface Props<Actions extends ActionSet>
{
    disabled?: boolean
    busy?: string
    className?: string
    actions: Actions
    defaultAction: keyof Actions
    onClick?: (ev: React.MouseEvent<HTMLButtonElement>, action: keyof Actions) => void
}
interface State<Actions extends ActionSet>
{
    action: keyof Actions
}
export class ActionButton<Actions extends ActionSet> extends React.Component<Props<Actions>, State<Actions>>
{
    constructor(props: Props<Actions>)
    {
        super(props)
        this.state = {action: props.defaultAction}
    }

    private _handleActionClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        const actionHandler = this.props.actions[this.state.action].onClick
        if (actionHandler)
            actionHandler(ev)
        else if (this.props.onClick)
            this.props.onClick(ev, this.state.action)
    }

    private _handleAlternateClicked(action: keyof Actions)
    {
        this.setState({action})
    }

    public render()
    {
        const props = this.props
        const active = props.actions[this.state.action]

        const disabled = !!props.disabled || !!props.busy
        const btnColor = active.color || 'primary'

        return <div className='btn-group ${props.className}' role='group'>
            <button disabled={disabled} className={`btn btn-${btnColor}`} onClick={ev => this._handleActionClicked(ev)}>
                {props.busy ? <Label icon='spinner fa-spin' label={props.busy}/> : <Label icon={active.icon} label={active.label}/>}
            </button>
            <button disabled={disabled} className={`btn btn-${btnColor} dropdown-toggle`} data-toggle='dropdown'></button>
            <div className='dropdown-menu'>
                {Object.entries(props.actions).filter(([key]) => key !== this.state.action).map(([key, val]) => {
                    const act = val as Action
                    return <button key={key} className='dropdown-item' onClick={() => this._handleAlternateClicked(key)}>
                        <Label icon={act.icon} label={act.label}/>
                    </button>
                })}
            </div>
        </div>
    }
}