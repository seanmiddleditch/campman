import * as React from 'react'

interface SettingsTabProps
{
    disabled?: boolean
    title: string
    visibility: 'Public'|'Hidden'
    onVisibilityChanged: (vis: 'Public'|'Hidden') => void
    onTitleChange: (title: string) => void
    onSaveClicked: () => void
}
export const SettingsTab = (props: SettingsTabProps) => (
    <div>
        <div className='form-group mt-sm-2'>
            <label htmlFor='title'>Title</label>
            <input type='text' className='form-control' name='title' disabled={props.disabled} value={props.title} onChange={ev => props.onTitleChange(ev.currentTarget.value)}/>
        </div>
        <div className='form-group mt-sm-2'>
            <label htmlFor='visbility'>Visibility</label>
            <div className='btn-group form-control'>
                {props.visibility === 'Public' && <button className='btn btn-info' about='Toggle Visibility' disabled={props.disabled} onClick={ev => props.onVisibilityChanged('Hidden')}>Public</button>}
                {props.visibility === 'Hidden' && <button className='btn btn-light' about='Toggle Visibility' disabled={props.disabled} onClick={ev => props.onVisibilityChanged('Public')}>Hidden</button>}
            </div>
        </div>
        <div className='btn-group float-right mt-sm-2'>
            <button className='btn btn-primary' disabled={props.disabled} onClick={ev => props.onSaveClicked()}>Save</button>
        </div>
    </div>
)