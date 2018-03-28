import * as React from 'react'
import { Link } from 'react-router-dom'
import { RenderRaw } from '../draft/render-raw'
import { AdventureData } from '../../types/content'
import { RawDraftContentState } from 'draft-js'
import { LocalDate } from '../local-date'
import { AdventureContainer } from '../containers/adventure'

interface Props
{
    id: number
}
export class ViewAdventure extends React.Component<Props>
{
    private _handleEditClicked(ev: React.MouseEvent<HTMLButtonElement>)
    {
        document.location.href = `${document.location.href}?edit=1`
    }

    public render()
    {
        return <AdventureContainer id={this.props.id}>
            {({adventure}) => adventure &&
                <>
                    <h1>
                        {adventure.title}
                        {true && <Link className='btn btn-link' to={`/adventures/${this.props.id}/edit`}><i className='fa fa-pencil'></i></Link>}
                    </h1>
                    <h2><LocalDate date={adventure.created_at}/></h2>
                    <RenderRaw document={adventure.rawbody}/>
                </>
            }
        </AdventureContainer>
    }
}
