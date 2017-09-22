import * as React from 'react';
import {Link} from 'react-router-dom';

import * as api from '../api/index';

interface LibrariesViewState
{
    libraries?: api.LibraryData[];
}
export default class LibrariesView extends React.Component<{}, LibrariesViewState>
{
    refs: {
        slug: HTMLInputElement,
        title: HTMLInputElement
    }

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

    private _renderLibrary(n: api.LibraryData)
    {
        const url = `${window.location.protocol}//${n.slug}.${window.location.host}/`;
        return <a key={n.slug} href={url} className='list-group-item'>
            <div className='list-item-name'><i className='fa fa-file'></i> {n.slug}</div>
        </a>;
    }

    private _handleClick(ev: React.MouseEvent<HTMLButtonElement>)
    {
        api.libraries.create({slug: this.refs.slug.value, title: this.refs.title.value});
        ev.preventDefault();
    }

    render()
    {
        const links = (() => {
            if (this.state.libraries !== undefined)
            {
                const links = this.state.libraries.map(n => this._renderLibrary(n));
                return <div className='list-group'>
                    {links}
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
            <div>
                <form><input ref='slug' type='text' placeholder='slug'/><input ref='title' type='text' placeholder='title'/><button onClick={ev => this._handleClick(ev)}>Create Library</button></form>
            </div>
            {links}
        </div>;
    }
}