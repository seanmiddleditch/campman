import * as React from 'react';
import { Link } from 'react-router-dom';
import LabelSchema from '../schemas/LabelSchema';

interface LabelsPageState
{
    labels?: LabelSchema[];
}
export default class LabelsPage extends React.Component<{}, LabelsPageState>
{
    constructor()
    {
        super();
        this.state = {};
    }

    private fetch()
    {
        fetch('/api/labels/list').then(result => result.ok ? result.json() : Promise.reject(result.statusText))
            .then(labels => this.setState({labels}))
            .catch(err => console.error(err, err.stack));
    }

    componentDidMount()
    {  
        this.fetch();
    }

    private renderLabel(l: LabelSchema)
    {
        return <Link key={l.id} to={'/l/' + l.slug} className='list-group-item'>
            <div className='list-item-name'><i className='fa fa-tag'></i> {l.slug}</div>
            <div className='list-item-details'>details</div>
        </Link>
    }

    render()
    {
        const links = () => {
            if (this.state.labels === undefined)
            {
                return <div>loading...</div>;
            }
            else if (this.state.labels.length == 0)
            {
                return <div>No labels are available</div>;
            }
            else
            {
                const links = this.state.labels.map(l => this.renderLabel(l));
                return <div className='list-group'>
                    {links}
                </div>;
            }
        };

        return <div>
            <div className='page-header'>
                <h1><i className='fa fa-tags'></i> Labels</h1>
            </div>
            {links()}
        </div>;
    }
}