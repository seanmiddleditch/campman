import * as React from 'react';
import { Link } from 'react-router-dom';
import {default as ClientGateway, RetrieveLabelResponse} from '../common/ClientGateway';

export interface LabelPageProps
{
    slug: string,
    gateway: ClientGateway
}
interface LabelPageState
{
    label?: RetrieveLabelResponse
}
export default class LabelPage extends React.Component<LabelPageProps, LabelPageState>
{
    constructor(props: LabelPageProps)
    {
        super(props);
        this.state = {};
    }

    componentDidMount()
    {
        this.props.gateway.retrieveLabel(this.props.slug)
            .then(label => this.setState({label}));
    }

    private renderNote(n: {slug: string, title: string})
    {
        return <Link key={n.slug} to={'/n/' + n.slug} className='list-group-item'>
            <div className='list-item-name'><i className='fa fa-file'></i> {n.title}</div>
            <div className='list-item-subtitle'>subtitle</div>
        </Link>;
    }

    render()
    {
        const links = (() => {
            if (this.state.label !== undefined)
            {
                const links = this.state.label.notes.length ? this.state.label.notes.map(n => this.renderNote(n)) : <div>Nothing here</div>;
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
                <h1><i className="fa fa-tags"></i> {this.props.slug}</h1>
            </div>
            {links}
        </div>;
    }
}