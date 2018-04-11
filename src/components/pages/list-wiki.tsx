import * as React from 'react'
import { WikiPageData } from '../../types'
import { PagesContainer } from '../containers/pages'
import { LoadSpinner } from '../load-spinner'

export const ListWiki: React.SFC = () =>
    <PagesContainer>{
        ({pages, fetching}) => fetching ?
            <LoadSpinner/> :
            <>
                <h1>Wiki Pages</h1>
                <div className='list-group list-group-flush'>
                    {pages && pages.map(page => (
                        <a key={page.slug} href={`/wiki/p/${page.slug}`} className='list-group-item'>
                            <div className='list-item-name'><i className='fa fa-file'></i> {page.title}</div>
                            {page.tags && <div className='list-item-details comma-separated'>{page.tags}</div>}
                        </a>
                    ))}
                    {pages && pages.length === 0 && <div className='list-group-item'>No results</div>}
                    <div className='list-group-item'>
                        <a className='btn btn-primary' href='/new-wiki'><i className='fa fa-plus'></i> Create New Page</a>
                    </div>
                </div>
            </>
    }</PagesContainer>
