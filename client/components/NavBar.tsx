import * as React from 'react';
import User from '../common/User';
import {NavLink} from 'react-router-dom';

export interface NavBarProps
{
    user?: User,
    onLogin: () => void,
    onLogout: () => void,
    onSearch: (text: string) => void
}
interface NavBarState
{
    searchText?: string
}
export default class NavBar extends React.Component<NavBarProps, NavBarState>
{
    constructor(props: NavBarProps)
    {
        super(props);
        this.state = {};
    }

    private _userBar()
    {
        return <div className='btn-group' role='group'>
            <button className='btn btn-secondary dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>{this.props.user.nickname}<span className='caret'/></button>
            <div className='dropdown-menu'>
                <a className='dropdown-item' href='#account'>Account</a>
                <a className='dropdown-item' onClick={this.props.onLogout} href='#logout'>Logout</a>
            </div>
        </div>;
    }

    render()
    {
        return <nav className='navbar fixed-top navbar-expand-lg navbar-light bg-light'>
            <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarTogglerDemo03' aria-controls='navbarTogglerDemo03' aria-expanded='false' aria-label='Toggle navigation'>
                <span className='navbar-toggler-icon'></span>
            </button>
            <NavLink className='navbar-brand' to='/n/home' exact>Library</NavLink>

            <div className='collapse navbar-collapse' id='navbarTogglerDemo03'>
                <ul className='navbar-nav mr-auto mt-2 mt-lg-0'>
                    <div className='nav-link disabled'>Adventures</div>
                    <NavLink className='nav-link' activeClassName='nav-link-active' to='/notes' isActive={(m, l) => !!m || l.pathname.startsWith('/n/')}>Notes</NavLink>
                    <NavLink className='nav-link' activeClassName='nav-link-active' to='/labels' isActive={(m, l) => !!m || l.pathname.startsWith('/l/')}>Labels</NavLink>
                    <div className='nav-link disabled'>Maps</div>
                    <div className='nav-link disabled'>Characters</div>
                    <div className='nav-link disabled'>Timeline</div>
                    <div className='nav-link disabled'>Media</div>
                </ul>
                <form className='input-group my-2 my-lg-0'>
                    <input className='form-control' type='text' placeholder='Search' aria-label='Search'/>
                    <span className='input-group-btn'>
                        <button className='btn btn-outline-primary my-2 my-sm-0' type='submit'><span className='fa fa-search'></span></button>
                    </span>
                </form>
                <ul className='navbar-nav ml-2 ml-lg-2 mt-2 mt-lg-0'>
                    {this.props.user ? this._userBar() : <button className='btn' onClick={this.props.onLogin}>Login (Google+)</button>}
                </ul>
            </div>
        </nav>;
    }
};

