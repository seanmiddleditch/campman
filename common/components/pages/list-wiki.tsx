import * as React from 'react'
import { WikiPageData } from '../../types'

interface Props
{
    editable: boolean
    pages: WikiPageData[]
}
export class ListWiki extends React.Component<Props>
{
    public render()
    {
        return (<div>
            <h1>Wiki Pages</h1>
            <div className='list-group'>
                {this.props.editable && (
                    <div className='list-group-item'>
                        <a className='btn btn-primary' href='/new-wiki'><i className='fa fa-plus'></i> New Page</a>
                    </div>
                )}
                {this.props.pages.map(page => (
                    <a key={page.slug} href={`/wiki/p/${page.slug}`} className='list-group-item'>
                        <div className='list-item-name'><i className='fa fa-file'></i> {page.title}</div>
                        {page.tags && <div className='list-item-details comma-separated'>{page.tags}</div>}
                    </a>
                ))}
                {this.props.pages.length === 0 && <div className='list-group-item'>No results</div>}
            </div>
        </div>)
    }
}
