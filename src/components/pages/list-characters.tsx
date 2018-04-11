import * as React from 'react'
import { CharacterData } from '../../types'
import { ImageThumb } from '../image-thumb'
import { CharactersContainer } from '../containers/characters'
import { LoadSpinner } from '../load-spinner'

const style = (size: number) => ({
    width: `${size+1}px`,
    height: `${size+1}px`,
    borderRadius: 8,
    margin: 24,
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid rgba(0, 0, 0, 0.3)'
} as React.CSSProperties)


export const ListCharacters: React.SFC = () =>
    <CharactersContainer>{
        ({characters, fetching}) => fetching ?
            <LoadSpinner/> :
            <>
                <a href='/new-char' className='btn btn-primary'><i className='fa fa-plus'></i> Add Character</a>
                <div className='clearfix'>
                    {characters && characters.map(char => (
                        <a key={char.id} href={`/chars/c/${char.slug || char.id}`}>
                            <div className='pull-left' style={style(200)}>{char.portrait ?
                                <ImageThumb hash={(char.portrait as any).contentMD5} size={200} caption={char.title}/> :
                                <span>{char.title}</span>
                            }</div>
                        </a>
                    ))}
                </div>
                {characters && characters.length === 0 && <div className='alert alert-warning'>No results</div>}
            </>
    }</CharactersContainer>
