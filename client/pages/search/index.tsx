import * as React from 'react'

import {Page, PageHeader, PageBody} from '../../components/page'

export interface SearchPageProps
{
    query: string
}
interface SearchPageState
{
}
export class SearchPage extends React.Component<SearchPageProps, SearchPageState>
{
    constructor(props: SearchPageProps)
    {
        super(props)
        this.state = {
            query: props.query
        }
    }

    render()
    {
        return (
            <Page>
                <PageHeader title='Search Results'/>
                <PageBody>{this.props.query}</PageBody>
            </Page>
        )
    }
}