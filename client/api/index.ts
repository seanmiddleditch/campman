import {MediaContent, Content, Config, CharacterContent} from '../../common/rpc'
import {LoginSession} from './login-session'
import {MediaAPI} from './media-api'
import {ContentAPI} from './content'

export {LoginSession, MediaAPI, ContentAPI}

export class API implements Content
{
    readonly config: Config
    readonly media: MediaContent
    readonly login: LoginSession
    readonly characters: CharacterContent

    constructor()
    {
        this.config = {
            publicURL: ''
        }
        this.media = new MediaAPI()
        this.login = new LoginSession(this.config)
        this.characters = new ContentAPI()
    }
}

export const api = new API()