import * as React from 'react';
import {Link} from 'react-router-dom';

import * as api from '../api/index';

interface LibrariesViewState
{
    libraries?: api.LibraryData[];
}
export default class LibrariesView extends React.Component<{}, LibrariesViewState>
{
    constructor()
    {
        super();
        this.state = {};
    }

    componentDidMount()
    {  
        api.libraries.fetchAll()
            .then(libraries => this.setState({libraries}));
    }

    private renderLibrary(n: api.LibraryData)
    {
        return <Link key={n.slug} to={'/library/' + n.slug} className='list-group-item'>
            <div className='list-item-name'><i className='fa fa-file'></i> {n.slug}</div>
        </Link>;
    }

    render()
    {
        const links = (() => {
            if (this.state.libraries !== undefined)
            {
                const links = this.state.libraries.map(n => this.renderLibrary(n));
                return <div className='list-group'>
                    {links}
                    <Link to='/create/library' className='list-group-item'><i className='fa fa-plus'></i> New Note</Link>
                </div>;
            }
            else
            {
                return <div>loading...</div>;
            }
        })();

        return <div>
            <div className='page-header'>
                <h1><i className='fa fa-book'></i> Libraries</h1>
            </div>
            {links}
        </div>;
    }
}