import { State } from '../state'
import { createContext, Store } from './context'
import { URL } from 'url'

export type State = State
export type SetState = (cb: (state: State) => State) => void
export const [StateProvider, StateConsumer] = createContext<State>({
    config: {publicURL: ''},
    data: {}
})