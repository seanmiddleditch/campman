import * as React from 'react';
import User from '../common/User';

export interface LoginLinksProps
{
    onLogin: () => void,
    onLogout: () => void,
    user: User,
    className?: string
}
export default class LoginLinks extends React.Component<LoginLinksProps>
{
    constructor(props: LoginLinksProps)
    {
        super(props);
    }

    render()
    {
        if (this.props.user)
            return <a className={this.props.className || ''} onClick={this.props.onLogout} href='#'>Logout</a>;
        else
            return <a className={this.props.className || ''} onClick={this.props.onLogin} href='#'>Login with Google</a>;
    }
}