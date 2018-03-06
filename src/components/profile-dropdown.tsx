import * as React from 'react'
import {ProfileData} from '../types'
import {API} from '../types'
import {Config} from '../state/config'
import {ImageThumb} from './image-thumb'
import {APIConsumer} from './api-context'
import {StateConsumer} from './state-context'

interface Props
{
    className?: string
    name?: string
    disabled?: boolean
    value?: number
    onChange: (id: number|undefined, profile: ProfileData|undefined) => void
}

interface PropsWithAPI extends Props
{
    api: API
    config: Config
}
interface State
{
    profiles?: ProfileData[]
    fetch?: Promise<void>
    error?: string
}
class ProfileDropdownInner extends React.Component<PropsWithAPI, State>
{
    state: State = {}

    componentDidMount()
    {
        if (!this.state.profiles)
            this._fetch()
    }

    private _fetch()
    {
        if (!this.state.fetch)
        {
            const {campaign} = this.props.config
            const fetch = this.props.api.listProfiles({campaignId: campaign ? campaign.id : 0})
                .then(profiles => this.setState({profiles, error: undefined, fetch: undefined}))
                .catch((e: Error) => this.setState({profiles: undefined, error: e.message, fetch: undefined}))
            this.setState({fetch})
        }
    }

    private _getProfile(id: number) : ProfileData|undefined
    {
        const {profiles} = this.state
        return profiles ? profiles.find(el => el.id === id) : undefined
    }

    private _onChange(val: string)
    {
        const id = val ? parseInt(val, 10) : undefined
        if (id)
            this.props.onChange(id, this._getProfile(id))
        else
            this.props.onChange(undefined, undefined)
    }

    render()
    {
        const {className, name, disabled, value} = this.props
        const {profiles, fetch, error} = this.state
        return <div className={`form-group ${className}`}>
            <select className='form-control' name={name} disabled={disabled || !!fetch || !!error} value={`${value}`} onChange={ev => this._onChange(ev.target.value)}>
                {fetch && <option value='' disabled={true}>Loading...</option>}
                {error && <option value='' disabled={true}>Error! ${error}</option>}
                {profiles && <option value=''>- none -</option>}
                {profiles && profiles.map(p => <option key={p.id} value={p.id}>{p.nickname || p.fullname}</option>)}
            </select>
        </div>
    }
}

export const ProfileDropdown = (props: Props) => <StateConsumer render={state => <APIConsumer render={api => <ProfileDropdownInner api={api} config={state.config} {...props}/>}/>}/>