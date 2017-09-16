import * as React from 'react';
import { Link } from 'react-router-dom';
import {Library, Labels} from '../common/ClientGateway';

export interface LabelsPageProps
{
    library: Library
}
interface LabelsPageState
{
    labels?: Labels;
}
export default class LabelsPage extends React.Component<LabelsPageProps, LabelsPageState>
{
    constructor()
    {
        super();
        this.state = {};
    }

    componentDidMount()
    {
        this.props.library.labels().then(labels => this.setState({labels}));
    }

    private renderLabel(l: {slug: string, notes: number})
    {
        return <Link key={l.slug} to={'/l/' + l.slug} className='list-group-item'>
            <div className='list-item-name'><i className='fa fa-tag'></i> {l.slug} <span className='badge badge-secondary'>{l.notes}</span></div>
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