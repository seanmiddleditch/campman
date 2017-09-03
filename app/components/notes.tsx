import * as React from 'react';
import * as $ from 'jquery';
import ContentEditable from './ContentEditable';
import RenderMarkup from './RenderMarkup';

export interface NoteTitleProps
{
    editing?: boolean,
    onChange: (v: string) => void,
    title: string
}
export const NoteTitle = (props: NoteTitleProps) => <h1 className='note-title' id='input-note-title'><ContentEditable placeholder='Enter Note Title' disabled={!props.editing} onChange={(value) => props.onChange(value)} value={props.title}/></h1>;

export interface NoteLabelsProps
{
    labels: string[],
    editing?: boolean,
    onChange: (v: string[]) => void
}
export function NoteLabels(props: NoteLabelsProps)
{
    if (props.editing)
         return <div className='note-labels'><i className='fa fa-tags'></i> <ContentEditable placeholder='label1,label2,label2' onChange={(value) => props.onChange(value.split(/[, ]+/).filter(s => s.length))} value={props.labels.join(', ')}/></div>;
    else if (props.labels.length)
        return <div className='note-labels'><i className='fa fa-tags'></i> <span>{props.labels.map(label => <span key={label} className='label note-label'><a href={'/l/' + label}>{label}</a></span>)}</span></div>;
    else
        return <span/>;
}

export interface NotBodyProps
{
    body: string,
    onChange: (v: string) => void,
    editing?: boolean
}
export function NoteBody(props: NotBodyProps)
{
    if (props.editing)
        return <div className='note-body'><ContentEditable multiline placeholder='Enter MarkDown content. Make [[links]] with double brackets.' onChange={props.onChange} value={props.body}/></div>;
    else
        return <div className='note-body'><RenderMarkup markup={props.body}/></div>
}

export interface NoteEditBarProps
{
    isNew?: boolean,
    editing?: boolean,
    onSave: () => void,
    onCancel: () => void,
    onDelete: () => void,
    onEdit: () => void
}
export function NoteEditBar(props: NoteEditBarProps)
{
    if (props.editing && !props.isNew)
        return <div className='btn-group'>
            <button id='note-btn-save' className='btn btn-primary' about='Save' onClick={props.onSave}><i className='fa fa-floppy-o'></i> Save</button>
            <button id='note-btn-cancel' className='btn btn-default' about='Cancel' onClick={props.onCancel}><i className='fa fa-ban'></i> Cancel</button>
            <button id='note-btn-delete' className='btn btn-danger' about='Delete' onClick={props.onDelete}><i className='fa fa-trash-o'></i> Delete</button>
        </div>;
    else if (props.editing)
        return <div className='btn-group'>
            <button id='note-btn-save' className='btn btn-primary' about='Save' onClick={props.onSave}><i className='fa fa-floppy-o'></i> Save</button>
        </div>;
    else
        return <div className='btn-group'>
            <button id='note-btn-edit' className='btn btn-default' about='Edit' onClick={props.onEdit}><i className='fa fa-pencil'></i> Edit</button>
        </div>;
}

export interface NoteProps
{
    editing?: boolean,
    note: any,
}
export interface NoteState
{
    title: string,
    body: string,
    labels: string[],
    oldTitle: string,
    oldBody: string,
    oldLabels: string[],
    editing: boolean,
    saving: boolean,
    id: number
}
export class Note extends React.Component<NoteProps, NoteState>
{
    note: any;

    constructor(props: NoteProps)
    {
        super(props);
        const note = props.note;
        this.state = {
            title: note.title,
            body: note.body,
            labels: note.labels,
            oldTitle: note.title,
            oldBody: note.body,
            oldLabels: note.labels,
            editing: !note.id,
            saving: false,
            id: note.id,

        };
    }

    edit()
    {
        const state = this.state;
        this.setState({
            editing: true,
            oldTitle: state.title,
            oldBody: state.body,
            oldLabels: state.labels
        });
    }

    cancel()
    {
        const state = this.state;
        this.setState({
            editing: false,
            title: state.oldTitle,
            body: state.oldBody,
            labels: state.oldLabels
        });
    }

    save()
    {
        if (this.state.editing && !this.state.saving)
        {
            this.setState({saving: true});

            const data = {
                title: this.state.title,
                body: this.state.body,
                labels: this.state.labels
            };

            $.ajax({url: window.location.toString(), method: 'POST', data: data}).then(() => {
                this.setState({editing: false, saving: false});
            }, () => {
                this.setState({saving: false});
            });
        }
    }

    delete()
    {
        if (this.state.editing && !this.state.saving)
        {
            $.ajax({url: window.location.toString(), method: 'DELETE'}).then(() => {
                window.location.assign('/notes');
            });
        }
    }

    render()
    {
        return <div>
            <NoteTitle editing={this.state.editing} title={this.state.title} onChange={(value) => this.setState({title: value})}/>
            <NoteLabels editing={this.state.editing} labels={this.state.labels} onChange={(value) => this.setState({labels: value})}/>
            <NoteBody editing={this.state.editing} body={this.state.body} onChange={(value) => this.setState({body: value})}/>
            <NoteEditBar editing={this.state.editing} isNew={!this.state.id} onEdit={() => this.edit()} onCancel={() => this.cancel()} onSave={() => this.save()} onDelete={() => this.delete()}/>
        </div>;
    }
}