import {Config} from '../../common/rpc/config'

export class LoginSession
{
    constructor(private _config: Config) {}

    showLoginDialog() : Promise<void>
    {
        return new Promise((resolve, reject) => {
            (window as EventTarget).addEventListener('message', () => resolve(), {once:true})
            const loginURL = new URL('/auth/google/login', this._config.publicURL)
            const popup = window.open(loginURL.toString(), 'google_login', 'menubar=false,scrollbars=false,location=false,width=400,height=300')
        })
    }

    endSession() : Promise<void>
    {
        const logoutURL = new URL('/auth/logout', this._config.publicURL)
        return new Promise((resolve, reject) => {
            fetch(logoutURL.toString(), {method: 'POST', mode: 'cors', credentials: 'include'}).then(async (res) => {
                if (res.ok) resolve()
                else reject()
            })
        })
    }
}