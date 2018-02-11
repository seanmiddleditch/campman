import * as React from 'react'
import {WikiForm} from '../forms/wiki-form'
import { WikiData } from '../../types';

interface Props
{
    editable: boolean
    pages: WikiData[]
}
interface State
{
    adding: boolean
}
export class ListWiki extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)
        this.state = {
            adding: false
        }
    }

    private _handleAdded(data: WikiData)
    {
        document.location.reload(true)
    }

    public render()
    {
        if (this.state.adding)
            return (<div>
                <WikiForm initial={{title: 'New Page', tags: '', rawbody: {}, visibility: 'Public'}} onSubmit={data => this._handleAdded(data)}/>
            </div>)
        else
            return (<div>
                <h1>Wiki Pages</h1>
                <div className='list-group'>
                    {this.props.editable && (
                        <div className='list-group-item'>
                            <button className='btn btn-primary' onClick={() => this.setState({adding: true})}><i className='fa fa-plus'></i> New Page</button>
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
