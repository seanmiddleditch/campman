import * as React from 'react';
import {Link} from 'react-router-dom';
import * as JQuery from 'jquery';

import * as api from '../api/index';

export interface LibrariesViewProps
{
    config: {publicURL: string}
}
interface LibrariesViewState
{
    libraries?: api.LibraryData[];
}
export default class LibrariesView extends React.Component<LibrariesViewProps, LibrariesViewState>
{
    refs: {
        modal: HTMLDivElement,
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
        const url = new URL(this.props.config.publicURL);
        url.hostname = `${n.slug}.${url.hostname}`;
        const target = url.toString();
        return <a key={n.slug} href={target} className='list-group-item'>
            <div className='list-item-name'><i className='fa fa-file'></i> {n.title}</div>
            <div className='list-item-details'>{target}</div>
        </a>;
    }

    private _handleClick(ev: React.MouseEvent<HTMLButtonElement>)
    {
        api.libraries.create({slug: this.refs.slug.value || this.refs.slug.placeholder, title: this.refs.title.value})
            .then(library => this.setState({libraries: this.state.libraries.concat([library])}))
            .then(() => (JQuery('#new-library-dialog') as any).modal('hide'));
        ev.preventDefault();
    }

    private _updateSlug(ev: React.ChangeEvent<HTMLInputElement>)
    {
        const title = ev.target.value.length ? ev.target.value : ev.target.placeholder;
        this.refs.slug.placeholder = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').slice(0, 32).trim().replace(/ /g, '-');
    }

    render()
    {
        const links = (() => {
            if (this.state.libraries !== undefined)
            {
                const links = this.state.libraries.map(n => this._renderLibrary(n));
                return <div className='list-group'>
                    {links}
                    <div className='list-group-item'>
                        <button className='btn btn-default' data-toggle='modal' data-target='#new-library-dialog'>
                            <i className='fa fa-plus'></i> New Library
                        </button>
                    </div>
                </div>;
            }
            else
            {
                return <div>loading...</div>;
            }
        })();

        return (
            <div>
                <div className='page-header'>
                    <h1><i className='fa fa-book'></i> Libraries</h1>
                </div>
                <div>
                    <div ref='modal' className='modal' id='new-library-dialog' data-backdrop='static' role='dialog'>
                        <div className='modal-dialog' role='document'>
                            <div className='modal-content'>
                                <div className='modal-header'>
                                    New Library
                                </div>
                                <div className='modal-body'>
                                    <div className='form-group'>
                                        <label htmlFor='title'>Title</label>
                                        <input className='form-control' ref='title' type='text' placeholder='My Library' onChange={ev => this._updateSlug(ev)}/>
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='slug'>Slug</label>
                                        <input className='form-control' ref='slug' type='text' placeholder='my-library'/>
                                    </div>
                                </div>
                                <div className='modal-footer'>
                                    <button className='btn btn-secondary' data-dismiss='modal'>Cancel</button>
                                    <button className='btn btn-primary' onClick={ev => this._handleClick(ev)}>Create Library</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {links}
            </div>
        );
    }
}