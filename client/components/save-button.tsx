import * as React from 'react'

interface Props {
    btnClass?: string
    disabled?: boolean
    saving?: boolean
    title?: string
    icon?: string
    working?: string
    onClick: () => void
}
export const SaveButton = ({btnClass, disabled, saving, title, icon, working, onClick}: Props) => (
    <button disabled={disabled} className={'btn btn-' + (btnClass || 'primary')} onClick={ev => {ev.preventDefault(); onClick()}}>
        {(!saving ? 
            <span><i className={'fa fa-' + (icon || 'floppy-o')}></i><span> {title || 'Save Changes'}</span></span> :
            <span><i className='fa fa-spinner fa-spin'></i><span> {working || 'Saving'}</span></span>
        )}
    </button>
)