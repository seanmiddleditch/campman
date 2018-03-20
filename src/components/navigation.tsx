import * as React from 'react'
import { StateConsumer } from './state-context'
import { NavLink } from 'react-router-dom'
import { Location } from 'history'
import { Authenticated } from './containers/authenticated'
import { CampaignData } from '../types'

const CampaignLinks: React.SFC<{campaign: CampaignData}> = ({campaign}) => 
    <ul className='navbar-nav mr-lg-auto'>
        <li className='nav-item'><a className='nav-link' href={`${campaign.url}adventures`}>Adventures</a></li>
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

const MainLinks: React.SFC = () =>
    <ul className='navbar-nav mr-lg-auto'>
        <NavLink className='nav-link' to='/campaigns'>Campaigns</NavLink>
    </ul>

export class Navigation extends React.Component<{location: Location}>
{
    public render()
    {
        return (
            <StateConsumer render={state => (
                <nav className='navbar sticky-top navbar-expand-lg navbar-light bg-light justify-content-between' style={{minHeight: 60}}>
                    {state.campaign ? (
                        <div className='navbar-brand'>
                            <a href={state.config.publicURL.toString()}><i className='fa fa-home'></i> </a>
                            <a href={state.campaign.url.toString()}>{state.campaign.title}</a>
                        </div>
                    ) : (
                        <div className='navbar-brand'><NavLink to='/'><i className='fa fa-home'></i> Campaign Manager</NavLink></div>
                    )}

                    <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbar-links' aria-controls='navbar-links' aria-expanded='false' aria-label='Toggle navigation'>
                        <span className='navbar-toggler-icon'></span>
                    </button>
                    <div className='collapse navbar-collapse' id='navbar-links'>
                        {state.campaign ?
                            <CampaignLinks campaign={state.campaign}/> :
                            <MainLinks/>
                        }

                        <form className='input-group mr-sm-2' action='/search' method='get'>
                            <input className='form-control' type='search' name='q' placeholder='Search' aria-label='Search'/>
                            <span className='input-group-append'>
                                <button className='btn btn-outline-primary my-2 my-sm-0' type='submit'>
                                    <span className='fa fa-search'></span>
                                </button>
                            </span>
                        </form>

                        <Authenticated render={({profile, login, logout}) => profile ?
                            <div className='btn-group' role='group'>
                                <button className='btn btn-secondary dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                    {profile.photoURL ? (
                                        <img width={24} height={24} src={profile.photoURL.toString()}/>
                                    ) : (
                                        <i className='navigation-bar-profile-photo fa fa-user-circle-o'></i>
                                    )}
                                    <span> {profile.nickname}</span>
                                </button>
                                <div className='dropdown-menu'>
                                    {state.campaign ?
                                        <NavLink className='dropdown-item' to='/campaigns'>Campaigns</NavLink> :
                                        <a className='dropdown-item' href={`${state.config.publicURL}campaigns`}>Campaigns</a>
                                    }
                                    <a className='dropdown-item' href={`${state.config.publicURL}profile`}>Profile</a>
                                    <button className='dropdown-item btn btn-link' onClick={logout}>Logout</button>
                                </div>
                            </div> :
                            <button className='btn btn-signin-google p-0 m-0' onClick={login}>
                                <img src={`${state.config.publicURL}images/google-signin/normal.png`} alt='Sign-in (Google+)'/>
                            </button>
                        }/>
                    </div>
                </nav>
            )}/>
        )
    }
}