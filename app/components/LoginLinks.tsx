import * as React from 'react';

export interface LoginLinksProps
{
    sessionKey?: string,
    onLogin: (sessionKey: string) => void,
    onLogout: () => void,
    className?: string
}
export default class LoginLinks extends React.Component<LoginLinksProps>
{
    private _onLogin()
    {
        (window as any).onLogin = (res: {sessionKey: string}) => this.props.onLogin(res.sessionKey);
        const popup = window.open('/auth/google/login', 'google_login', 'menubar=false,scrollbars=false,location=false,width=400,height=300');
    }

    private _onLogout()
    {
        fetch('/logout').then(() => this.props.onLogout());
    }

    render()
    {
        if (this.props.sessionKey)
            return <a className={this.props.className || ''} onClick={() => this._onLogout()}>Logout</a>;
        else
            return <a className={this.props.className || ''} onClick={() => this._onLogin()}>Login with Google</a>;
    }
}