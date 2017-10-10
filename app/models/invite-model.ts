import * as modelsafe from 'modelsafe'
import * as squell from 'squell'
import {LibraryModel} from './library-model'

@modelsafe.model({name: 'invite'})
export class InviteModel extends modelsafe.Model
{
    @modelsafe.attr(modelsafe.STRING)
    @squell.attr({primaryKey: true})
    public id: string

    @modelsafe.attr(modelsafe.STRING)
    public email: string

    @modelsafe.assoc(modelsafe.BELONGS_TO, () => LibraryModel)
    @squell.assoc({onDelete: 'CASCADE', foreignKeyConstraint: true, foreignKey: {allowNull: false}})
    public library: LibraryModel
}
