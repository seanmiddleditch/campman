import * as React from 'react';

import {Page, PageHeader, PageBody} from '../../components/page'
import {LabelsList} from './components/labels-list'

export function ListLabelsPage()
{
    return (
        <Page>
            <PageHeader icon='tags' title='Labels'/>
            <PageBody>
                <LabelsList/>
            </PageBody>
        </Page>
    )
}