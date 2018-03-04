import * as React from 'react'
import {API, Config} from '../types'
import {StateProvider} from './state'
import {APIProvider} from './api'
import {Navigation} from './site/navigation'

interface Props
{
    api: API
    config: Config
}
export class Application extends React.Component<Props>
{
    public render()
    {
        const header = undefined as {icon: string, title: string}|undefined

        return (
            <StateProvider state={{config: this.props.config}}>
                <APIProvider api={this.props.api}>
                    <Navigation/>
                    <main role='main' className='container mt-2'>
                        {header && <div className='page-header'>
                            <h1>{header.icon && <i className={`fa fa-${header.icon}`}></i> }{header.title}</h1>
                        </div>}
                        <div className='page'>
                            {this.props.children}
                        </div>
                    </main>
                    <footer className='mt-2' style={{position: 'absolute', bottom: 0, height: 60, width: '100%', margin: 0, padding: 0, color: 'grey', fontSize: 'small'}}>
                        <div className='text-muted text-center'>Powered by <a href='https://github.com/seanmiddleditch/campman'>Campaign Manager</a></div>
                    </footer>
                </APIProvider>
            </StateProvider>
        )
    }
}