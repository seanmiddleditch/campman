import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as ReactRouter from 'react-router';
import {NavLink} from 'react-router-dom';

import * as api from '../../api/index';
import {Config} from '../../client';

require('../../styles/navigation.css');

export interface NavigationBarProps
{
    library?: api.LibraryData;
    config: Config;
    user?: api.UserData;
    onLogin: () => void;
    onLogout: () => void;
    onSearch: (text: string) => void;
}
interface NavigationBarState
{
    searchText: string
}
export default class NavigationBar extends React.Component<NavigationBarProps, NavigationBarState>
{
    static contextTypes = { router: PropTypes.object.isRequired };
    
    context: ReactRouter.RouterChildContext<NavigationBarProps>;

    constructor(props: NavigationBarProps)
    {
        super(props);
        this.state = {
            searchText: ''
        };
    }

    private _userBar()
    {
        return <div className='btn-group' role='group'>
            <button className='btn btn-secondary dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>{this.props.user.nickname || this.props.user.fullName}<span className='caret'/></button>
            <div className='dropdown-menu'>
                <a className='dropdown-item' href={(new URL('/libraries', this.props.config.publicURL)).toString()}>Libraries</a>
                <a className='dropdown-item' href={(new URL('/profile', this.props.config.publicURL)).toString()}>Profile</a>
                <a className='dropdown-item' href='#' onClick={this.props.onLogout}>Logout</a>
            </div>
        </div>;
    }

    private _search(ev: React.FormEvent<HTMLFormElement>)
    {
        if (this.state.searchText !== '')
        {
            this.setState({searchText: ''});
            this.context.router.history.push('/search?q=' + encodeURIComponent(this.state.searchText));
        }
        ev.preventDefault();
    }

    render()
    {
        return <nav className='navbar fixed-top navbar-expand-lg navbar-light bg-light'>
            <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarTogglerDemo03' aria-controls='navbarTogglerDemo03' aria-expanded='false' aria-label='Toggle navigation'>
                <span className='navbar-toggler-icon'></span>
            </button>
            <NavLink className='navbar-brand' to='/' exact>{(this.props.library && this.props.library.title) || 'Campaign Manager'}</NavLink>

            <div className='collapse navbar-collapse' id='navbarTogglerDemo03'>
                {this.props.library && (
                    <ul className='navbar-nav mr-auto mt-2 mt-lg-0'>
                        <div className='nav-link disabled'>Adventures</div>
                        <NavLink className='nav-link' activeClassName='nav-link-active' to={'/notes'} isActive={(m, l) => !!m || l.pathname.startsWith('/n/')}>Notes</NavLink>
                        <NavLink className='nav-link' activeClassName='nav-link-active' to={'/labels'} isActive={(m, l) => !!m || l.pathname.startsWith('/l/')}>Labels</NavLink>
                        <div className='nav-link disabled'>Maps</div>
                        <div className='nav-link disabled'>Characters</div>
                        <div className='nav-link disabled'>Timeline</div>
                        <NavLink className='nav-link' activeClassName='nav-link-active' to={'/media'}>Media</NavLink>
                    </ul>
                )}
                <form className='input-group my-2 my-lg-0' onSubmitCapture={ev => this._search(ev)}>
                    <input className='form-control' type='search' placeholder='Search' aria-label='Search' value={this.state.searchText} onChange={ev => this.setState({searchText: ev.target.value})}/>
                    <span className='input-group-btn'>
                        <button className='btn btn-outline-primary my-2 my-sm-0' type='submit'><span className='fa fa-search'></span></button>
                    </span>
                </form>
                <ul className='navbar-nav ml-2 ml-lg-2 mt-2 mt-lg-0'>
                    {this.props.user && this.props.user.id ?
                        this._userBar() :
                        <button className='btn btn-signin-google' onClick={this.props.onLogin}><img src='/images/google-signin/normal.png' alt='Sign-in (Google+)'/></button>
                    }
                </ul>
            </div>
        </nav>;
    }
};

