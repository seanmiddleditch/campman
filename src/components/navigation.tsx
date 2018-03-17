import * as React from 'react'
import {StateConsumer} from './state-context'
import {APIConsumer} from './api-context'

export class Navigation extends React.Component
{
    public render()
    {
        return (
            <APIConsumer render={api => <StateConsumer render={state => (
                <nav className='navbar sticky-top navbar-expand-lg navbar-light bg-light justify-content-between' style={{minHeight: 60}}>
                    {state.campaign ? (
                        <div className='navbar-brand'>
                            <a href={state.config.publicURL.toString()}><i className='fa fa-home'></i> </a>
                            <a href={state.campaign.url.toString()}>{state.campaign.title}</a>
                        </div>
                    ) : (
                        <div className='navbar-brand'><a href={state.config.publicURL.toString()}><i className='fa fa-home'></i> Campaign Manager</a></div>
                    )}

                    <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbar-links' aria-controls='navbar-links' aria-expanded='false' aria-label='Toggle navigation'>
                        <span className='navbar-toggler-icon'></span>
                    </button>
                    <div className='collapse navbar-collapse' id='navbar-links'>
                        {state.campaign ? (
                            <ul className='navbar-nav mr-lg-auto'>
                                <li className='nav-item'><a className='nav-link' href={`${state.campaign.url}adventures`}>Adventures</a></li>
                                <li className='nav-item'><a className='nav-link' href={`${state.campaign.url}wiki`}>Wiki</a></li>
                                <li className='nav-item'><a className='nav-link' href={`${state.campaign.url}tags`}>Tags</a></li>
                                <li className='nav-item'><a className='nav-link' href={`${state.campaign.url}maps`}>Maps</a></li>
                                <li className='nav-item'><a className='nav-link' href={`${state.campaign.url}chars`}>Characters</a></li>
                                <li className='nav-item'><a className='nav-link disabled' href='#'>Timeline</a></li>
                                <li className='nav-item'><a className='nav-link' href={`${state.campaign.url}files`}>Files</a></li>
                                <li className='nav-item dropdown'>
                                    <a className='nav-link' href='#' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'><i className='fa fa-cog'></i></a>
                                    <div className='dropdown-menu'>
                                        <a className='dropdown-item' href={`${state.campaign.url}settings`}>Settings</a>
                                        <a className='dropdown-item' href={`${state.campaign.url}membership`}>Members</a>
                                    </div>
                                </li>
                            </ul>
                        ) : (
                            <ul className='navbar-nav mr-lg-auto'>
                                <div className='nav-link'><a href={`${state.config.publicURL}campaigns`}>Campaigns</a></div>
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

                        {state.profile ? (
                            <div className='btn-group' role='group'>
                                <button className='btn btn-secondary dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                    {state.profile.photoURL ? (
                                        <img width={24} height={24} src={state.profile.photoURL.toString()}/>
                                    ) : (
                                        <i className='navigation-bar-profile-photo fa fa-user-circle-o'></i>
                                    )}
                                    <span> {state.profile.nickname}</span>
                                </button>
                                <div className='dropdown-menu'>
                                    <a className='dropdown-item' href={`${state.config.publicURL}campaigns`}>Campaigns</a>
                                    <a className='dropdown-item' href={`${state.config.publicURL}profile`}>Profile</a>
                                    <button className='dropdown-item btn btn-link' onClick={() => {api.endSession().then(() => window.location.reload(true)); return false}}>Logout</button>
                                </div>
                            </div>
                        ) : (
                            <button className='btn btn-signin-google p-0 m-0' onClick={() => api.showLoginDialog().then(() => window.location.reload(true))}>
                                <img src={`${state.config.publicURL}images/google-signin/normal.png`} alt='Sign-in (Google+)'/>
                            </button>
                        )}
                    </div>
                </nav>
            )}/>}/>
        )
    }
}