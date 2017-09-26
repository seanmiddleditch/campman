import {RPCHelper} from './helpers'
import {User} from '../types'

export class SessionData
{
    sessionKey?: string;
    user?: User;
};

export class AuthAPI
{
    private _rpc = new RPCHelper();
    private _publicURL: string = '/';

    configure(publicURL: string)
    {
        this._publicURL = publicURL;
    }

    session() : Promise<SessionData>
    {
        return this._rpc.get<SessionData>('/auth/session');
    }

    login()
    {
        return new Promise<User>((resolve, reject) => {
            const handler = (ev: any) => {
                window.removeEventListener('message', handler);
                this.session()
                    .then(session => session.user ? resolve(session.user) : reject(new Error('Login failed')))
                    .catch(err => reject(err));
            };
            window.addEventListener('message', handler, false);
            const loginURL = new URL('/auth/google/login', this._publicURL);
            const popup = window.open(loginURL.toString(), 'google_login', 'menubar=false,scrollbars=false,location=false,width=400,height=300');
        });
    }

    logout() : Promise<void>
    {
        const logoutURL = new URL('/auth/logout', this._publicURL);
        return this._rpc.post(logoutURL.toString());
    }
};

export const auth = new AuthAPI();