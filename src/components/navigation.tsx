import * as React from 'react'
import { NavLink } from 'react-router-dom'
import { Location } from 'history'
import { CurrentCampaign } from './containers/current-campaign'
import { Authenticated } from './containers/authenticated'
import { WithConfig } from './containers/with-config'
import { CampaignData } from '../types'
import { MainLink } from './main-link'
import * as urlJoin from 'url-join'

const CampaignLinks: React.SFC<{campaign: CampaignData}> = ({campaign}) => 
    <ul className='navbar-nav mr-lg-auto'>
        <li className='nav-item'><NavLink className='nav-link' to='/adventures'>Adventures</NavLink></li>
        <li className='nav-item'><a className='nav-link' href='/wiki'>Wiki</a></li>
        <li className='nav-item'><a className='nav-link' href='/maps'>Maps</a></li>
        <li className='nav-item'><a className='nav-link' href='/chars'>Characters</a></li>
        <li className='nav-item'><a className='nav-link' href='/files'>Files</a></li>
        <li className='nav-item dropdown'>
            <a className='nav-link' href='#' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'><i className='fa fa-cog'></i></a>
            <div className='dropdown-menu'>
                <NavLink className='dropdown-item' to='/settings'>Settings</NavLink>
                <NavLink className='dropdown-item' to='/membership'>Members</NavLink>
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
            <CurrentCampaign render={campaign => (
                <nav className='navbar sticky-top navbar-expand-lg navbar-light bg-light justify-content-between' style={{minHeight: 60}}>
                    <div className='navbar-brand'>
                        <MainLink to='/'><i className='fa fa-home'></i></MainLink>&nbsp;
                        {campaign ?
                            <NavLink to='/'>{campaign.title}</NavLink> :
                            <NavLink to='/'>Campaign Manager</NavLink>
                        }
                    </div>
                    
                    <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbar-links' aria-controls='navbar-links' aria-expanded='false' aria-label='Toggle navigation'>
                        <span className='navbar-toggler-icon'></span>
                    </button>
                    <div className='collapse navbar-collapse' id='navbar-links'>
                        {campaign ?
                            <CampaignLinks campaign={campaign}/> :
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
                                    {campaign ?
                                        <NavLink className='dropdown-item' to='/campaigns'>Campaigns</NavLink> :
                                        <MainLink className='dropdown-item' to='/campaigns'>Campaigns</MainLink>
                                    }
                                    <MainLink className='dropdown-item' to='/profile'>Profile</MainLink>
                                    <button className='dropdown-item btn btn-link' onClick={logout}>Logout</button>
                                </div>
                            </div> :
                            <button className='btn btn-signin-google p-0 m-0' onClick={login}>
                                <WithConfig>{config => <img src={urlJoin(config.publicURL.toString(), '/images/google-signin/normal.png')} alt='Sign-in (Google+)'/>}</WithConfig>
                            </button>
                        }/>
                    </div>
                </nav>
            )}/>
        )
    }
}