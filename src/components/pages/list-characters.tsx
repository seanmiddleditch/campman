import * as React from 'react'
import {CharacterData} from '../../types'
import {ImageThumb} from '../image-thumb'

const style = (size: number) => ({
    width: `${size+1}px`,
    height: `${size+1}px`,
    borderRadius: 8,
    margin: 24,
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid rgba(0, 0, 0, 0.3)'
} as React.CSSProperties)

interface Props
{
    chars: CharacterData[]
    editable: boolean
}
export class ListCharacters extends React.Component<Props>
{
    public render()
    {
        const {chars, editable} = this.props
        return <div>
            {editable && <a href='/new-char' className='btn btn-primary'><i className='fa fa-plus'></i> Add Character</a>}
            <div className='clearfix'>
                {chars.map(char => (
                    <a key={char.id} href={`/chars/c/${char.slug || char.id}`}>
                        <div className='pull-left' style={style(200)}>{char.portrait ?
                            <ImageThumb hash={(char.portrait as any).contentMD5} size={200} caption={char.title}/> :
                            <span>{char.title}</span>
                        }</div>
                    </a>
                ))}
            </div>
            {chars.length === 0 && <div className='alert alert-warning'>No results</div>}
        </div>
    }
}
