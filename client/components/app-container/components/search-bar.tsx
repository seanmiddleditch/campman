import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as ReactRouter from 'react-router';

export interface SearchBarProps
{
    className?: string
}
interface SearchBarState
{
    searchText: string
}
export default class SearchBar extends React.Component<SearchBarProps, SearchBarState>
{
    static contextTypes = { router: PropTypes.object.isRequired }
    
    context: ReactRouter.RouterChildContext<SearchBarProps>

    constructor(props: SearchBarProps)
    {
        super(props)
        this.state = {
            searchText: ''
        };
    }

    private _handleFormSubmit(ev: React.FormEvent<HTMLFormElement>)
    {
        if (this.state.searchText !== '')
        {
            this.setState({searchText: ''})
            this.context.router.history.push('/search?q=' + encodeURIComponent(this.state.searchText))
        }
        ev.preventDefault()
    }

    render()
    {
        return (
            <form className={'input-group ' + this.props.className} onSubmitCapture={ev => this._handleFormSubmit(ev)}>
                <input className='form-control' type='search' placeholder='Search' aria-label='Search' value={this.state.searchText} onChange={ev => this.setState({searchText: ev.target.value})}/>
                <span className='input-group-btn'>
                    <button className='btn btn-outline-primary my-2 my-sm-0' type='submit'>
                        <span className='fa fa-search'></span>
                    </button>
                </span>
            </form>
        )
    }
};

