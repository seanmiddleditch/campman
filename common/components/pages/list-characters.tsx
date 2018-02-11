import * as React from 'react'
import {CharacterData} from '../../types'
import {ImageThumb} from '../image-thumb'
import {NewCharacterDialog} from '../new-character-dialog'

interface Props
{
    chars: CharacterData[]
    editable: boolean
}
interface State
{
    showAdd: boolean
}
export class ListCharacters extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {showAdd: false}
    }

    private _handleAddClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        ev.preventDefault()
        this.setState({showAdd: true})
    }

    private _handleCancelAdd()
    {
        this.setState({showAdd: false})
    }

    private _handleCreated()
    {
        document.location.reload(true)
    }

    public render()
    {
        const {chars, editable} = this.props
        return <div>
            <NewCharacterDialog visible={this.state.showAdd} onCancel={() => this._handleCancelAdd()} onCreate={() => this._handleCreated()}/>
            <h1>Characters</h1>
            {editable && <button onClick={ev => this._handleAddClicked(ev)} className='btn btn-primary'><i className='fa fa-plus'></i> Add Character</button>}
            <div className='clearfix'>
            {chars.map(char => (
                <a key={char.id} href={`/chars/c/${char.slug || char.id}`}>
                    <div className='card float-left m-2' style={{width: '12rem', height: '14rem'}}>
                        <div style={{height: 140, overflow: 'hidden'}}>
                            {char.portrait && <ImageThumb hash={(char.portrait as any).contentMD5} size={200} className='card-img-top' alt={char.title}/>}
                        </div>
                        <div className='card-body'>
                            <h5 className='card-title'>{char.title}</h5>
                        </div>
                    </div>
                </a>
            ))}
            </div>
            {chars.length === 0 && <div className='alert alert-warning'>No results</div>}
        </div>
    }
}
