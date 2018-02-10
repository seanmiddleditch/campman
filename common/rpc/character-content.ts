import {CharacterData} from '../types'

export interface CharacterContent
{
    saveCharacter(char: CharacterData) : Promise<CharacterData>
}