import { Config } from './config'
import { ProfileData } from '../types'

export interface State
{
    config: Config
    profile?: ProfileData
}