import * as React from 'react';
import {NavLink} from 'react-router-dom';

import LoginLinks from './LoginLinks';

export interface NavigationProps
{
    sessionKey?: string,
    onLogin: (sessionKey: string) => void,
    onLogout: () => void,
}
export default function Navigation(props: NavigationProps)
{
    return <div className='nav-container'><nav className='nav'>
        <NavLink className='nav-link' activeClassName='nav-link-active' to='/n/home' exact>Home</NavLink>
        <NavLink className='nav-link' activeClassName='nav-link-active' to='/notes' isActive={(m, l) => !!m || (l.pathname != '/n/home' && l.pathname.startsWith('/n/'))}>Notes</NavLink>
        <NavLink className='nav-link' activeClassName='nav-link-active' to='/labels' isActive={(m, l) => !!m || l.pathname.startsWith('/l/')}>Labels</NavLink>
        <LoginLinks className='nav-link' sessionKey={props.sessionKey} onLogin={props.onLogin} onLogout={props.onLogout}/>
    </nav></div>;
}