import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as ReactRouter from 'react-router'
import {NavLink} from 'react-router-dom'

import {SearchBar} from './search-bar'

import {User, Config} from '../../../types'

export interface ProfileBarProps
{
    config: Config
    user: User
    onLogout: () => void
}
export const ProfileBar = (props: ProfileBarProps) => (
    <div className='btn-group' role='group'>
        <button className='btn btn-secondary dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
            <span className='navigation-bar-profile'>
                <span className='navigation-bar-profile-name'>{props.user.nickname || props.user.fullName}</span>
                {props.user.photoURL ?
                    <img className='navigation-bar-profile-photo profile-photo' src={props.user.photoURL}/> :
                    <i className='navigation-bar-profile-photo fa fa-user-circle-o'></i>
                }
            </span>
        </button>
        <div className='dropdown-menu'>
            <a className='dropdown-item' href={(new URL('/libraries', props.config.publicURL)).toString()}>Libraries</a>
            <a className='dropdown-item' href={(new URL('/profile', props.config.publicURL)).toString()}>Profile</a>
            <a className='dropdown-item' href='#' onClick={props.onLogout}>Logout</a>
        </div>
    </div>
)
