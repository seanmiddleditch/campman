export class LoginSession
{
    constructor(publicURL)
    {
        this._publicURL = publicURL
    }

    login()
    {
        return new Promise((resolve, reject) => {
            window.addEventListener('message', () => resolve(), {once:true})
            const loginURL = new URL('/auth/google/login', this._publicURL)
            const popup = window.open(loginURL.toString(), 'google_login', 'menubar=false,scrollbars=false,location=false,width=400,height=300')
        })
    }

    logout()
    {
        const logoutURL = new URL('/auth/logout', this._publicURL)
        return new Promise((resolve, reject) => {
            fetch(logoutURL, {method: 'POST', credentials: 'include'}).then(async (res) => {
                console.log(await res.text())
                if (res.ok) resolve()
                else reject()
            })
        })
    }
}