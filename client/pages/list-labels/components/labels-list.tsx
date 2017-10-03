import * as React from 'react'

import {LabelItem} from './label-item';

import * as api from '../../../api'

interface LabelsListProps
{
    children?: any
}
interface LabelsListState
{
    labels?: api.LabelData[]
}
export class LabelsList extends React.Component<LabelsListProps, LabelsListState>
{
    constructor(props: LabelsListProps)
    {
        super(props)
        this.state = {}
    }

    componentDidMount()
    {  
        api.labels.fetchAll()
            .then(labels => this.setState({labels}))
            .catch(err => {
                console.log(err, err.stack);
                this.setState({labels: []});
            });
    }
    
    render()
    {
        return (
            <div className='list-group'>
                {this.state.labels === undefined ?
                    <div className='list-group-item'>loading...</div> :
                    this.state.labels.map(labels => <LabelItem label={labels}/>)}
                {this.props.children}
            </div>
        )
    }
}