import * as React from 'react';
import { Link } from 'react-router-dom';
import LabelSchema from '../schemas/LabelSchema';

export interface LabelPageProps
{
    slug: string
}
export default class LabelPage extends React.Component<LabelPageProps>
{
    private label?: LabelSchema;

    fetch()
    {
        $.getJSON('/api/labels/getBySlug/' + this.props.slug).then((data: any) => {
            this.label = data;
            this.forceUpdate();
        });
    }

    render()
    {
        if (!this.label)
            this.fetch();

        const links = (() => {
            if (this.label !== undefined)
            {
                const links = this.label.notes.map(n => <Link key={n.id} to={'/n/' + n.slug} className="list-group-item"><i className="fa fa-file"></i> {n.title}</Link>);
                return <div className="list-group">
                    {links}
                </div>;
            }
            else
            {
                return <div>loading...</div>;
            }
        })();

        return <div>
            <div className="page-header">
                <h1><i className="fa fa-tags"></i> Label {this.props.slug}</h1>
            </div>
            {links}
        </div>;
    }
}