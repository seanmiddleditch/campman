import * as React from 'react';
import ClientGateway from '../common/ClientGateway';

export interface SearchPageProps
{
    gateway: ClientGateway,
    query: string
}
interface SearchPageState
{
}
export default class SearchPage extends React.Component<SearchPageProps, SearchPageState>
{
    constructor(props: SearchPageProps)
    {
        super(props);
        this.state = {
            query: props.query
        };
    }

    render()
    {
        return <div>{this.props.query}</div>;
    }
}