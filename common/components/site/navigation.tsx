import * as React from 'react'
import * as PropTypes from 'prop-types'
import {Content} from '../../rpc'

export class Navigation extends React.Component
{
    context: {
        rpc: Content
    }
    static contextTypes = {
        rpc: PropTypes.object
    }

    public render()
    {
        const campaign = this.context.rpc.config.campaign
        const profile = this.context.rpc.config.profile
        const publicURL = this.context.rpc.config.publicURL

        return (
            <nav className='navbar sticky-top navbar-expand-lg navbar-light bg-light justify-content-between' style={{minHeight: 60}}>
                {campaign ? (
                    <div className='navbar-brand'>
                        <a href={publicURL}><i className='fa fa-home'></i> </a>
                        <a href={campaign.url}>{campaign.title}</a>
                    </div>
                ) : (
                    <div className='navbar-brand'><a href={publicURL}><i className='fa fa-home'></i> Campaign Manager</a></div>
                )}

                <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbar-links' aria-controls='navbar-links' aria-expanded='false' aria-label='Toggle navigation'>
                    <span className='navbar-toggler-icon'></span>
                </button>
                <div className='collapse navbar-collapse' id='navbar-links'>
                    {campaign ? (
                        <ul className='navbar-nav mr-lg-auto'>
                            <li className='nav-item'><a className='nav-link disabled' href='#'>Adventures</a></li>
                            <li className='nav-item'><a className='nav-link' href={`${campaign.url}wiki`}>Wiki</a></li>
                            <li className='nav-item'><a className='nav-link' href={`${campaign.url}tags`}>Tags</a></li>
                            <li className='nav-item'><a className='nav-link' href={`${campaign.url}maps`}>Maps</a></li>
                            <li className='nav-item'><a className='nav-link' href={`${campaign.url}chars`}>Characters</a></li>
                            <li className='nav-item'><a className='nav-link disabled' href='#'>Timeline</a></li>
                            <li className='nav-item'><a className='nav-link' href={`${campaign.url}files`}>Files</a></li>
                            <li className='nav-item dropdown'>
                                <a className='nav-link' href='#' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'><i className='fa fa-cog'></i></a>
                                <div className='dropdown-menu'>
                                    <a className='dropdown-item' href={`${campaign.url}settings`}>Settings</a>
                                    <a className='dropdown-item' href={`${campaign.url}membership`}>Members</a>
                                </div>
                            </li>
                        </ul>
                    ) : (
                        <ul className='navbar-nav mr-lg-auto'>
                            <div className='nav-link'><a href={`${publicURL}campaigns`}>Campaigns</a></div>
                        </ul>
                    )}

                    <form className='input-group mr-sm-2' action='/search' method='get'>
                        <input className='form-control' type='search' name='q' placeholder='Search' aria-label='Search'/>
                        <span className='input-group-append'>
                            <button className='btn btn-outline-primary my-2 my-sm-0' type='submit'>
                                <span className='fa fa-search'></span>
                            </button>
                        </span>
                    </form>

                    {profile ? (
                        <div className='btn-group' role='group'>
                            <button className='btn btn-secondary dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                <span>{profile.nickname}</span>
                                {profile.photoURL ? (
                                    <img width={24} height={24} src={profile.photoURL}/>
                                ) : (
                                    <i className='navigation-bar-profile-photo fa fa-user-circle-o'></i>
                                )}
                            </button>
                            <div className='dropdown-menu'>
                                <a className='dropdown-item' href={`${publicURL}campaigns`}>Campaigns</a>
                                <a className='dropdown-item' href={`${publicURL}profile`}>Profile</a>
                                <button className='dropdown-item btn btn-link' onClick={() => {this.context.rpc.session.endSession().then(() => window.location.reload(true)); return false}}>Logout</button>
                            </div>
                        </div>
                    ) : (
                        <button className='btn btn-signin-google p-0 m-0' onClick={() => this.context.rpc.session.showLoginDialog().then(() => window.location.reload(true))}>
                            <img src={`${publicURL}images/google-signin/normal.png`} alt='Sign-in (Google+)'/>
                        </button>
                    )}
                </div>
            </nav>
        )
    }
}