import * as React from 'react'
import * as PropTypes from 'prop-types'

type Callback<T> = (state: Readonly<T>) => T
type Observer<T> = () => void
type Render<T> = (state: T, setState: (cb: Callback<T>) => void) => React.ReactNode

export class Store<T>
{
    private _state: T
    private _observers: (Observer<T>|undefined)[] = []
    private _busy = false

    constructor(initialState: T)
    {
        this._state = initialState
    }

    public getState(): Readonly<T>
    {
        if (this._busy)
            throw new Error('Do not call getState during a callback; the state is available as an argument')

        return this._state
    }

    public setState(cb: Callback<T>)
    {
        if (this._busy)
            throw new Error('Do not call setState during a setState callback; just return a single new state')

        try
        {
            this._busy = true
            const state = this._state
            this._state = Object.assign({}, state, cb(state))
        }
        finally
        {
            this._busy = false
        }
        
        // invoke any subscribers callbacks. note that new subscribers may
        // be added during this loop, meaning that the observers array will
        // be mutated, so a regular for-of loop cannot be used here. we also
        // cache the length so we don't invoke any newly-added subscriber
        // callbacks, since they should already have the up-to-date state
        const observers = this._observers
        const count = observers.length
        for (let i = 0; i != count; ++i)
        {
            const cb = observers[i]
            if (cb)
                cb()
        }

        // condense the observers array for any undefined entries left by
        // unsubscribe calls
        let out = 0
        for (const cb of observers)
            if (cb)
                observers[out++] = cb
        observers.length = out
    }

    public subscribe(callback: Observer<T>)
    {
        if (this._busy)
            throw new Error('Do not subscribe to a store during a setState callback; callback should not invoke side-effects')

        this._observers.push(callback)
            
        // unsubscribe function
        let subscribed = true
        return () => {
            if (this._busy)
                throw new Error('Do not unsubscribe from a store during a setState callback; callback should not invoke side-effects')

            if (subscribed)
            {
                subscribed = false
                const index = this._observers.indexOf(callback)
                if (index !== -1)
                    this._observers[index] = undefined
            }
        }
    }
}

const contextTypes = {
    store: PropTypes.object
}

type Context<T> = {store: Store<T>}
class ContextProvider<T> extends React.Component<Context<T>, Context<T>> implements React.ChildContextProvider<Context<T>>
{
    static childContextTypes = contextTypes

    constructor(props: Context<T>)
    {
        super(props)
        this.state = {store: props.store}
    }

    public getChildContext(): Context<T>
    {
        return this.state
    }

    public render()
    {
        return this.props.children
    }
}

type ConsumerProps<T> = {render: Render<T>, children?: never}|{render?: never, children: Render<T>}
class ContextConsumer<T> extends React.Component<ConsumerProps<T>, Context<T>>
{
    context: Context<T>
    static contextTypes = contextTypes

    private _unlink?: () => void

    constructor(props: ConsumerProps<T>, context: Context<T>)   {
        super(props)
        this.state = {store: context.store}
    }

    public componentDidMount()
    {
        this._unlink = this.state.store.subscribe(() => {
            this.forceUpdate()
        })
    }

    public componentWillUnmount()
    {
        if (this._unlink)
        {
            this._unlink()
            this._unlink = undefined
        }
    }

    public render()
    {
        const props = this.props
        const {store} = this.state

        const render = 'render' in props ?
            props.render :
            typeof props.children === 'function' ?
                props.children :
                undefined

        if (render)
            return render(store.getState(), (cb: Callback<T>) => store.setState(cb))
        else
            return null
    }
}

export function createContext<T>(defaultValue: Readonly<T>)
{
    class Provider extends ContextProvider<T> {}
    class Consumer extends ContextConsumer<T> {}

    return [Provider, Consumer] as [typeof Provider, typeof Consumer]
}