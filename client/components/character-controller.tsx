import * as React from 'react'

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
    saving?: Promise<void>
    errors?: Errors
}
export class CharacterController extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {}
    }

    private _submit(data: CharacterFields)
    {
        if (!this.state.saving)
        {
            const body = new FormData()
            if (this.props.id) body.append('id', this.props.id.toString())
            if (data.slug) body.append('slug', data.slug)
            if (data.title) body.append('title', data.title)
            if (typeof data.visible === 'string') body.append('visible', data.visible ? 'visible' : '')
            if (data.portrait instanceof File) body.append('portrait', data.portrait)
            if (data.body) body.append('rawbody', data.body ? JSON.stringify(data.body) : '')

            const saving = fetch('/chars', {
                method: 'POST',
                mode: 'same-origin',
                credentials: 'include',
                body
            }).then(async (response) => {
                if (!response.ok)
                    throw new Error(response.statusText)
                else if (response.status !== 200)
                    throw new Error(response.statusText)

                const responseBody = await response.json()
                if (responseBody.status === 'success')
                {
                    this.setState({saving: undefined, errors: undefined}, () => this.props.onSubmit())
                }
                else
                {
                    const errors = responseBody.errors
                    this.setState({saving: undefined, errors})
                }
            }).catch(err => {
                console.error(err)
                alert(err)
                this.setState({saving: undefined})
            })
            this.setState({saving, errors: undefined})
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