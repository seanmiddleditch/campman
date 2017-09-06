import * as React from 'react';
import { Link } from 'react-router-dom';
import LabelSchema from '../schemas/LabelSchema';

export interface LabelPageProps
{
    slug: string
}
interface LabelPageState
{
    label?: LabelSchema
}
export default class LabelPage extends React.Component<LabelPageProps, LabelPageState>
{
    constructor(props: LabelPageProps)
    {
        super(props);
        this.state = {};
    }

    private fetch()
    {
        fetch('/api/labels/getBySlug/' + this.props.slug).then(result => result.ok ? result.json() : Promise.reject(result.statusText))
            .then(label => this.setState({label}))
            .catch(err => console.error(err, err.stack));
    }

    componentDidMount()
    {
        this.fetch();
    }

    render()
    {
        const links = (() => {
            if (this.state.label !== undefined)
            {
                const links = this.state.label.notes.map(n => <Link key={n.id} to={'/n/' + n.slug} className="list-group-item"><i className="fa fa-file"></i> {n.title}</Link>);
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