import * as React from 'react';
import { Link } from 'react-router-dom';
import LabelSchema from '../schemas/LabelSchema';

export default class LabelsPage extends React.Component<any>
{
    private labels?: LabelSchema[];

    private fetch()
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

        const links = () => {
            if (this.labels === undefined)
            {
                return <div>loading...</div>;
            }
            else if (this.labels.length == 0)
            {
                return <div>No labels are available</div>;
            }
            else
            {
                const links = this.labels.map(l => <Link key={l.id} to={'/l/' + l.slug} className="list-group-item"><i className="fa fa-tag"></i> {l.slug}</Link>);
                return <div className="list-group">
                    {links}
                </div>;
            }
        };

        return <div>
            <div className="page-header">
                <h1><i className="fa fa-tags"></i> Labels</h1>
            </div>
            {links()}
        </div>;
    }
}