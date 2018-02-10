import {MediaContent, Content, Config, CharacterContent} from '../../common/rpc'
import {LoginSession} from './login-session'
import {MediaAPI} from './media-api'
import {ContentAPI} from './content'
import {config} from './config'

export {LoginSession, MediaAPI, ContentAPI, config}

export class API implements Content
{
    readonly media: MediaContent
    readonly login: LoginSession
    readonly characters: CharacterContent
    readonly config: Config

    constructor()
    {
        this.media = new MediaAPI()
        this.login = new LoginSession()
        this.characters = new ContentAPI()
        this.config = config
    }
}

export const api = new API()