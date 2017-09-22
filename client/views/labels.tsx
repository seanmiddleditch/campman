import * as React from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api/index';

interface LabelsViewState
{
    labels?: api.LabelData[];
}
export default class LabelsView extends React.Component<{}, LabelsViewState>
{
    constructor()
    {
        super();
        this.state = {};
    }

    componentDidMount()
    {
        api.labels.fetchAll().then(labels => this.setState({labels}));
    }

    private renderLabel(l: api.LabelData)
    {
        return <Link key={l.slug} to={'/l/' + l.slug} className='list-group-item'>
            <div className='list-item-name'><i className='fa fa-tag'></i> {l.slug} <span className='badge badge-secondary'>{l.numNotes || 0}</span></div>
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