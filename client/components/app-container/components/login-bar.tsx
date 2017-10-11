import * as React from 'react'

export interface LoginBarProps
{
    onLogin: () => void
}
export const LoginBar = (props: LoginBarProps) => (
    <button className='btn btn-signin-google' onClick={props.onLogin}><img src='/images/google-signin/normal.png' alt='Sign-in (Google+)'/></button>
)
