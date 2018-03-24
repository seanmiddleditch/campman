import * as React from 'react'
import * as moment from 'moment'

interface Props
{
    date: Date
}
interface State
{
    local: string
}
export class LocalDate extends React.Component<Props, State>
{
    state: State = { local: '' }

    private static _format(date: Date|string)
    {
        return moment(date).format('dddd, MMMM Do, YYYY - h:mma')
    }

    public componentDidMount()
    {
        this.setState({local: LocalDate._format(this.props.date)})
    }

    public componentWillReceiveProps(nextProps: Props)
    {
        if (nextProps.date !== this.props.date)
            this.setState({local: LocalDate._format(nextProps.date)})
    }

    public render()
    {
        return this.state.local
    }
}