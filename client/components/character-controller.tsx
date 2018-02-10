import * as React from 'react'
import {ContentAPI, CharacterData, ContentError} from '../api/content'

export interface CharacterFields
{
    title: string
    slug?: string
    body: object|null
    visible: boolean
    portrait?: File|{hash: string}
}

type Errors = {[key: string]: string|undefined}

interface Props
{
    id?: number
    onSubmit: () => void
    form: (props: {saving: boolean, submit: (data: CharacterFields) => void, errors?: Errors, props?: any}) => any
    props?: any
}
interface State
{
    saving?: Promise<CharacterData>
    errors?: Errors
}
export class CharacterController extends React.Component<Props, State>
{
    private _api = new ContentAPI()

    constructor(props: Props)
    {
        super(props)
        this.state = {}
    }

    private _submit(data: CharacterFields)
    {
        if (!this.state.saving)
        {
            const saving = this._api.saveCharacter({...data, id: this.props.id})
            this.setState({saving})
            saving.then(char => {
                this.setState({saving: undefined}, () => this.props.onSubmit())
            }).catch(err => {
                if (err instanceof ContentError)
                console.error(err)
                alert(err)
                this.setState({saving: undefined})
            })
        }
    }

    public render()
    {
        return this.props.form({
            saving: !!this.state.saving,
            errors: this.state.errors,
            props: this.props.props,
            submit: (data: CharacterFields) => this._submit(data)
        })
    }
}