import {RPCHelper} from './helpers';

export class UserData
{
    id?: number;
    fullname?: string;
    nickname?: string;
};
export class SessionData
{
    sessionKey?: string;
    user?: UserData;
};

export class AuthAPI
{
    private _rpc = new RPCHelper();

    session() : Promise<SessionData>
    {
        return this._rpc.get<SessionData>('/auth/session');
    }

    login()
    {
        return new Promise<UserData>((resolve, reject) => {
            const handler = (ev: any) => {
                window.removeEventListener('message', handler);
                this.session()
                    .then(session => session.user ? resolve(session.user) : reject(new Error('Login failed')))
                    .catch(err => reject(err));
            };
            window.addEventListener('message', handler, false);
            const popup = window.open('/auth/google/login', 'google_login', 'menubar=false,scrollbars=false,location=false,width=400,height=300');
        });
    }

    logout() : Promise<void>
    {
        return this._rpc.post('/auth/logout');
    }
};

export const auth = new AuthAPI();