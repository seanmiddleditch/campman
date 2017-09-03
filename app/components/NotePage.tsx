import * as React from 'react';
import RenderMarkup from './RenderMarkup';
import NoteSchema from '../schemas/NoteSchema';
import * as helpers from './notes';

export interface NotePageProps
{
    slug: string
}
export default class NotePage extends React.Component<NotePageProps>
{
    private note?: NoteSchema;

    fetch()
    {
        $.getJSON('/api/notes/getBySlug/' + this.props.slug).then((data: any) => {
            this.note = data;
            this.forceUpdate();
        });
    }

    render()
    {
        if (this.note !== undefined)
        {
            return <div>
                <helpers.NoteTitle editing={false} title={this.note.title} onChange={t => this.note.title = t}/>
                <helpers.NoteLabels editing={false} labels={this.note.labels} onChange={l => this.note.labels = l}/>
                <RenderMarkup markup={this.note.body}/>
            </div>;
        }
        else
        {
            this.fetch();
            return <div>loading...</div>;
        }
    }
}