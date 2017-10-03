import * as React from 'react'
import * as ReactRouter from 'react-router'
import * as PropTypes from 'prop-types'
import * as ReactDOM from 'react-dom'

import {LabelInput} from './label-input'
import {MarkEditor} from '../../../components/mark-editor'

import * as api from '../../../api'
import {Note} from '../../../types'

export interface NoteEditorProps
{
    note: Note
    slug: string
    disabled?: boolean
    onSave: (note: Note) => void
    onCancel: () => void
}
interface NoteEditorState
{
    saving: boolean,
    title: string,
    subtitle: string,
    labels: string[]
    rawbody: any
    preview: boolean
}
export class NoteEditor extends React.Component<NoteEditorProps, NoteEditorState>
{
    static contextTypes = { router: PropTypes.object.isRequired };
    
    context: ReactRouter.RouterChildContext<NoteEditorProps>;

    private unblockHistory: () => void;
    
    constructor(props: NoteEditorProps)
    {
        super(props);
        this.state = {
            saving: false,
            preview: false,

            title: props.note && props.note.title ? props.note.title : '',
            subtitle: props.note && props.note.subtitle ? props.note.subtitle : '',
            rawbody: props.note && props.note.rawbody ? props.note.rawbody : '',
            labels: props.note && props.note.labels ? props.note.labels.slice() : []
        };
    }

    private _hasChanges()
    {
        return this.props.note && (this.props.note.title !== this.state.title ||
            this.props.note.subtitle !== this.state.subtitle ||
            this.props.note.rawbody !== this.state.rawbody ||
            this.props.note.labels.join(',') !== this.state.labels.join(','));
    }

    private _handleSaveClicked()
    {
        this.props.onSave({
            title: this.state.title,
            subtitle: this.state.subtitle,
            labels: this.state.labels.slice(),
            rawbody: this.state.rawbody
        })
    }

    private _handleCancelClicked()
    {
        if (!this._hasChanges() || confirm('Canceling now will lose your changes. Click Cancel to continue editing.'))
        {
            this.unblockHistory();
            this.props.onCancel();
        }
    }

    private _removeLabel(label: string)
    {
        const index = this.state.labels.findIndex(l => l === label);
        if (index !== -1)
        {
            this.state.labels.splice(index, 1);
            this.setState({labels: this.state.labels});
        }
    }

    private _addLabel(label: string)
    {
        const index = this.state.labels.findIndex(l => l === label);
        if (index === -1)
        {
            this.state.labels.push(label);
            this.setState({labels: this.state.labels});
        }
    }

    private _update(fields: {title?: string, subtitle?: string, labels?: string|string[], rawbody?: string})
    {
        if (fields.title)
            this.setState({title: fields.title});
        if (fields.subtitle)
            this.setState({subtitle: fields.subtitle});
        if (typeof fields.labels === 'string')
            this.setState({labels: fields.labels.split(',').filter(s => s.length)});
        else if (fields.labels)
            this.setState({labels: fields.labels});
        if (fields.rawbody)
            this.setState({rawbody: fields.rawbody});
    }

    componentDidMount()
    {
        this.unblockHistory = (this.context.router.history as any).block((location: any, action: any) => {
            if (this._hasChanges())
                return 'Navigating away now will lose your changes. Click Cancel to continue editing.';
            else
                return undefined;
        }) as () => void;
    }

    componentWillUnmount()
    {
        this.unblockHistory();
    }

    render()
    {
        return <div className='note-editor'>
            <div className='input-group'>
                <span className='input-group-addon'>Title</span>
                <input type='text' className='form-control' disabled={this.props.disabled} onChange={ev => this._update({title: ev.target.value})} defaultValue={this.state.title} placeholder='Note Title'/>
            </div>
            <div className='input-group mt-sm-2'>
                <span className='input-group-addon'>Subtitle</span>
                <input type='text' className='form-control' disabled={this.props.disabled} onChange={ev => this._update({subtitle: ev.target.value})} defaultValue={this.state.subtitle} placeholder='Subtitle'/>
            </div>
            <div className='input-group mt-sm-2'>
                <span className='input-group-addon'><i className='col fa fa-tags'></i></span>
                <LabelInput labels={this.state.labels} disabled={this.props.disabled} onAdd={label => this._addLabel(label)} onRemove={label => this._removeLabel(label)}/>
            </div>
            <div className='floating-editbar-container'>
                <div className='floating-editbar'>
                    <div className='btn-group mt-sm-2' role='group'>
                        <button id='note-btn-save' className='btn btn-primary' about='Save' disabled={this.props.disabled}  onClick={() => this._handleSaveClicked()}><i className='fa fa-floppy-o'></i> Save</button>
                        <div className='btn-group'>
                            <button className='btn btn-primary dropdown-toggle dropdown-toggle-split' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'><span className='caret'/></button>
                            <div className='dropdown-menu'>
                                <button id='note-btn-cancel' className='dropdown-item' about='Cancel' disabled={this.props.disabled} onClick={() => this._handleCancelClicked()}><i className='fa fa-ban'></i> Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <MarkEditor document={this.state.rawbody} disabled={this.props.disabled || this.state.preview} onChange={document => this._update({rawbody: document})}/>
        </div>;
    }
};