import * as React from 'react';

export interface SearchViewProps
{
    query: string
}
interface SearchViewState
{
}
export default class SearchView extends React.Component<SearchViewProps, SearchViewState>
{
    constructor(props: SearchViewProps)
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