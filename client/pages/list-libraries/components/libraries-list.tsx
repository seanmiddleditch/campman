import * as React from 'react'

import LibraryItem from './library-item';

import * as api from '../../../api'

interface LibrariesListProps
{
    children?: any
    publicURL: string
}
interface LibrariesListState
{
    libraries?: api.LibraryData[]
}
export default class LibrariesList extends React.Component<LibrariesListProps, LibrariesListState>
{
    constructor(props: LibrariesListProps)
    {
        super(props)
        this.state = {}
    }

    componentDidMount()
    {  
        api.libraries.fetchAll()
            .then(libraries => this.setState({libraries}))
            .catch(err => {
                console.log(err, err.stack);
                this.setState({libraries: []});
            });
    }

    render()
    {
        return (
            <div className='list-group'>
                {this.state.libraries === undefined ?
                    <div className='list-group-item'>loading...</div> :
                    this.state.libraries.map(lib => <LibraryItem publicURL={this.props.publicURL} library={lib}/>)}
                {this.props.children}
            </div>
        )
    }
}