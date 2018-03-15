import * as React from 'react'
import { StyleButton } from './style-button'

interface Props
{
    disabled?: boolean
    buttons?: () => React.ReactNode
    isStyleActive: (type: string) => boolean
    isBlockActive: (type: string) => boolean
    onStyleClick: (type: string) => void
    onBlockClick: (type: string) => void
    onMediaClick: () => void
}
export const ButtonBar: React.SFC<Props> = ({disabled, buttons, isStyleActive, isBlockActive, onStyleClick, onBlockClick, onMediaClick}) =>
    <div className='clearfix border-bottom pb-2 pt-2 sticky-top bg-white' style={{top: '60px'}}>
        <span className='btn-group' role='group'>
            <StyleButton active={isStyleActive('BOLD')} onToggle={() => onStyleClick('BOLD')}><i className='fa fa-bold'></i></StyleButton>
            <StyleButton active={isStyleActive('ITALIC')} onToggle={() => onStyleClick('ITALIC')}><i className='fa fa-italic'></i></StyleButton>
            <StyleButton active={isStyleActive('UNDERLINE')} onToggle={() => onStyleClick('UNDERLINE')}><i className='fa fa-underline'></i></StyleButton>
        </span>
        <span className='btn-group ml-sm-2' role='group'>
            <StyleButton active={isBlockActive('unstyled')} onToggle={() => onBlockClick('unstyled')}>Normal</StyleButton>
            <StyleButton active={isBlockActive('header-one')} onToggle={() => onBlockClick('header-one')}>H1</StyleButton>
            <StyleButton active={isBlockActive('header-two')} onToggle={() => onBlockClick('header-two')}>H2</StyleButton>
            <StyleButton active={isBlockActive('header-three')} onToggle={() => onBlockClick('header-three')}>H3</StyleButton>
            <StyleButton active={isBlockActive('secret')} onToggle={() => onBlockClick('secret')}><i className='fa fa-eye-slash'></i></StyleButton>
        </span>
        <span className='btn-group ml-sm-2' role='group'>
            <StyleButton active={isBlockActive('ordered-list')} onToggle={() => onBlockClick('ordered-list-item')}>1.</StyleButton>
            <StyleButton active={isBlockActive('unordered-list')} onToggle={() => onBlockClick('unordered-list-item')}>&bull;</StyleButton>
        </span>
        <span className='btn-group ml-sm-2' role='group'>
            <StyleButton active={false} onToggle={() => onMediaClick()}><i className='fa fa-picture-o'></i></StyleButton>
        </span>
        {buttons && buttons()}
    </div>
