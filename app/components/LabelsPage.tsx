import * as React from 'react';
import { Link } from 'react-router-dom';
import LabelSchema from '../schemas/LabelSchema';

export default class LabelsPage extends React.Component<any>
{
    private labels?: LabelSchema[];

    fetch()
    {
        $.getJSON('/api/labels/list').then((data: any) => {
            this.labels = data;
            this.forceUpdate();
        });
    }

    render()
    {
        if (!this.labels)
            this.fetch();

        const links = (() => {
            if (this.labels !== undefined)
            {
                const links = this.labels.map(l => <Link key={l.id} to={'/l/' + l.slug} className="list-group-item"><i className="fa fa-tag"></i> {l.slug}</Link>);
                return <div className="list-group">
                    {links}
                    <Link to="/create/Label" className="list-group-item"><i className="fa fa-plus"></i> New Label</Link>
                </div>;
            }
            else
            {
                return <div>loading...</div>;
            }
        })();

        return <div>
            <div className="page-header">
                <h1><i className="fa fa-tags"></i> Labels</h1>
            </div>
            {links}
        </div>;
    }
}