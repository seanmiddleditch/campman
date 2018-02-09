import {config} from './config'

export class LoginSession
{
    login() : Promise<void>
    {
        return new Promise((resolve, reject) => {
            (window as EventTarget).addEventListener('message', () => resolve(), {once:true})
            const loginURL = new URL('/auth/google/login', config.publicURL.toString())
            const popup = window.open(loginURL.toString(), 'google_login', 'menubar=false,scrollbars=false,location=false,width=400,height=300')
        })
    }

    logout() : Promise<void>
    {
        const logoutURL = new URL('/auth/logout', config.publicURL.toString())
        return new Promise((resolve, reject) => {
            fetch(logoutURL.toString(), {method: 'POST', mode: 'cors', credentials: 'include'}).then(async (res) => {
                console.log(await res.text())
                if (res.ok) resolve()
                else reject()
            })
        })
    }
}