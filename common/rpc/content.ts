import {CharacterContent} from "./character-content"
import {MediaContent} from "./media-content"
import {Config} from "./config"

export interface Content
{
    readonly characters: CharacterContent
    readonly media: MediaContent
    readonly config: Config
}