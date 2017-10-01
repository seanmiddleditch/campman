import LabelModel from './label';
import LibraryModel from './library';
import * as modelsafe from 'modelsafe';
import * as squell from 'squell';

@modelsafe.model({name: 'media'})
@squell.model({indexes: [{name: 'library_media_unique_path', fields: ['libraryId', 'path'], unique: true}], timestamps: true})
export default class MediaModel extends modelsafe.Model
{
    @modelsafe.attr(modelsafe.STRING)
    @squell.attr({primaryKey: true})
    public path: string;

    @modelsafe.attr(modelsafe.STRING)
    public s3key: string;

    @modelsafe.assoc(modelsafe.BELONGS_TO, () => LibraryModel)
    @squell.assoc({onDelete: 'CASCADE', foreignKey: {name: 'libraryId', allowNull: false}, foreignKeyConstraint: true})
    public library: LibraryModel;

    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.maxLength(255)
    @modelsafe.minLength(0)
    public caption: string;

    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.maxLength(255)
    @modelsafe.minLength(0)
    public attribution: string;

    @modelsafe.assoc(modelsafe.BELONGS_TO_MANY, () => LabelModel)
    @squell.assoc({through: 'media_label'})
    public labels: LabelModel[] = [];
}

@modelsafe.model({name: 'media_label'})
@squell.model({timestamps: false})
class MediaLabel extends modelsafe.Model
{
}