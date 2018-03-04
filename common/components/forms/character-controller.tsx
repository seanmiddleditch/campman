import * as React from 'react'
import {API, APIError, CharacterData} from '../../types'
import {APIConsumer} from '../api'

type Errors = {[key: string]: string|undefined}

interface Props
{
    id?: number
    onSubmit: () => void
    form: (props: {saving: boolean, submit: (data: CharacterData) => void, errors?: Errors, props?: any}) => any
    props?: any
}
interface State
{
    saving?: Promise<CharacterData>
    errors?: Errors
}
export class CharacterController extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {}
    }

    private _submit(data: CharacterData, api: API)
    {
        if (!this.state.saving)
        {
            const saving = api.saveCharacter({...data, id: this.props.id})
            this.setState({saving})
            saving.then(char => {
                this.setState({saving: undefined}, () => this.props.onSubmit())
            }).catch(err => {
                if (err instanceof APIError)
                console.error(err)
                alert(err)
                this.setState({saving: undefined})
            })
        }
    }

    public render()
    {
        return <APIConsumer render={api => this.props.form({
            saving: !!this.state.saving,
            errors: this.state.errors,
            props: this.props.props,
            submit: (data: CharacterData) => this._submit(data, api)
        })}/>
    }
}