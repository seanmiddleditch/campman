import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as ReactRouter from 'react-router'
import {NavLink} from 'react-router-dom'

import {SearchBar} from './search-bar'
import {ProfileBar} from './profile-bar'
import {LoginBar} from './login-bar'

import * as api from '../../../api'
import {Config, User, Library} from '../../../types'

require('../styles/navigation.css')

export interface NavigationBarProps
{
    library?: Library
    config: Config
    user?: User
    onLogin: () => void
    onLogout: () => void
}
export const NavigationBar = (props: NavigationBarProps) => (
    <nav className='navbar fixed-top navbar-expand-lg navbar-light bg-light'>
        <NavLink className='navbar-brand' to='/' exact>{(props.library && props.library.title) || 'Campaign Manager'}</NavLink>
        <div className='collapse navbar-collapse' id='navbarTogglerDemo03'>
            {props.library ?
                (<ul className='navbar-nav mr-auto mt-2 mt-lg-0'>
                    <div className='nav-link disabled'>Adventures</div>
                    <NavLink className='nav-link' activeClassName='nav-link-active' to={'/notes'} isActive={(m, l) => !!m || l.pathname.startsWith('/n/')}>Notes</NavLink>
                    <NavLink className='nav-link' activeClassName='nav-link-active' to={'/labels'} isActive={(m, l) => !!m || l.pathname.startsWith('/l/')}>Labels</NavLink>
                    <div className='nav-link disabled'>Maps</div>
                    <div className='nav-link disabled'>Characters</div>
                    <div className='nav-link disabled'>Timeline</div>
                    <NavLink className='nav-link' activeClassName='nav-link-active' to={'/media'}>Media</NavLink>
                </ul>) :
                (<ul className='navbar-nav mr-auto mt-2 mt-lg-0'>
                    <NavLink className='nav-link' activeClassName='nav-link-active' to={'/libraries'}>Libraries</NavLink>
                </ul>)
            }
            <SearchBar className='my-2 my-lg-0'/>
            <ul className='navbar-nav ml-2 ml-lg-2 mt-2 mt-lg-0'>
                {props.user && props.user.id ?
                    <ProfileBar user={props.user} onLogout={props.onLogout} config={props.config}/> :
                    <LoginBar onLogin={props.onLogin}/>
                }
            </ul>
        </div>
    </nav>
)
