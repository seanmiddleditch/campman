import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as PropTypes from 'prop-types';

import LabelInput from './label-input';

import * as api from '../api/index';

export interface NoteEditorProps
{
    note: api.NoteData,
    slug: string,
    exists: boolean,
    onSave: (note: api.NoteData) => void,
    onCancel: () => void
}
interface NoteEditorState
{
    saving: boolean,
    label: string,
    title: string,
    subtitle: string,
    labels: string[],
    body: string
}
export default class NoteEditor extends React.Component<NoteEditorProps, NoteEditorState>
{
    static contextTypes = { router: PropTypes.object.isRequired };
    
    context: ReactRouter.RouterChildContext<NoteEditorProps>;

    private unblockHistory: () => void;
    
    constructor(props: NoteEditorProps)
    {
        super(props);
        this.state = {
            saving: false,
            label: '',

            title: props.note && props.note.title ? props.note.title : '',
            subtitle: props.note && props.note.subtitle ? props.note.subtitle : '',
            body: props.note && props.note.body ? props.note.body : '',
            labels: props.note && props.note.labels ? props.note.labels.slice() : []
        };
    }

    private _hasChanges()
    {
        return this.props.note && (this.props.note.title !== this.state.title ||
            this.props.note.subtitle !== this.state.subtitle ||
            this.props.note.body !== this.state.body ||
            this.props.note.labels.join(',') !== this.state.labels.join(','));
    }

    private _save()
    {
        if (!this.state.saving)
        {
            this.setState({saving: true});
            const note = {
                title: this.state.title,
                subtitle: this.state.subtitle,
                labels: this.state.labels,
                body: this.state.body,
            };

            api.notes.update(this.props.slug, note)
                .then(() => {this.setState({saving: false}); this.props.onSave(note);})
                .catch((err: Error) => this.setState({saving: false}));
        }
    }

    private _cancel()
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
            this.setState({labels: this.state.labels, label: ''});
        }
    }

    private _update(fields: {title?: string, subtitle?: string, labels?: string|string[], body?: string})
    {
        if (fields.title)
            this.setState({title: fields.title});
        if (fields.subtitle)
            this.setState({subtitle: fields.subtitle});
        if (typeof fields.labels === 'string')
            this.setState({labels: fields.labels.split(',').filter(s => s.length)});
        else if (fields.labels)
            this.setState({labels: fields.labels});
        if (fields.body)
            this.setState({body: fields.body});
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
        //<input type='text' className='form-control' placeholder='tag1, tag2, ...' onChange={ev => this._update({labels: ev.target.value})} defaultValue={this.state.note.labels.join(', ')}/>
        return <div className='note-editor'>
            <div className='input-group'>
                <span className='input-group-addon'>Title</span>
                <input type='text' className='form-control' onChange={ev => this._update({title: ev.target.value})} defaultValue={this.state.title} placeholder='Note Title'/>
            </div>
            <div className='input-group mt-sm-2'>
                <span className='input-group-addon'>Subtitle</span>
                <input type='text' className='form-control' onChange={ev => this._update({subtitle: ev.target.value})} defaultValue={this.state.subtitle} placeholder='Subtitle'/>
            </div>
            <div className='input-group mt-sm-2'>
                <span className='input-group-addon'><i className='col fa fa-tags'></i></span>
                <LabelInput labels={this.state.labels} onAdd={label => this._addLabel(label)} onRemove={label => this._removeLabel(label)}/>
            </div>
            <div className='floating-editbar-container'>
                <div className='floating-editbar'>
                    <div className='btn-group mt-sm-2' role='group'>
                        <button id='note-btn-save' className='btn btn-primary' about='Save' onClick={() => this._save()}><i className='fa fa-floppy-o'></i> Save</button>
                        <div className='btn-group'>
                            <button className='btn btn-primary dropdown-toggle dropdown-toggle-split' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'><span className='caret'/></button>
                            <div className='dropdown-menu'>
                                <button id='note-btn-cancel' className='dropdown-item' about='Cancel' onClick={() => this._cancel()}><i className='fa fa-ban'></i> Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='input-group mt-sm-2'>
                <textarea onChange={ev => this._update({body: ev.target.value})} defaultValue={this.state.body} style={{width: '100%', minHeight: '20em'}}/>
            </div>
        </div>;
    }
};