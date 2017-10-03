import * as React from 'react'

import Page, {PageHeader, PageBody} from '../../components/page'

export function NotFoundPage()
{
    return (
        <Page>
            <PageHeader icon='exclamation-triangle' title='Not Found'/>
            <PageBody>
                The requested content cannot be found.
            </PageBody>
        </Page>
    )
}