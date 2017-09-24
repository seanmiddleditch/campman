import LabelModel from './label';
import {LibraryAccessModel} from './library';
import * as modelsafe from 'modelsafe';
import * as squell from 'squell';
import User from '../auth/user';

@modelsafe.model({name: 'user'})
@squell.model({indexes: [{name: 'google', fields: ['googleId']}]})
export default class UserModel extends modelsafe.Model implements User
{
    @modelsafe.attr(modelsafe.INTEGER)
    @squell.attr({primaryKey: true, autoIncrement: true})
    public id: number;

    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.minLength(1)
    public fullName: string;

    @modelsafe.attr(modelsafe.STRING, {optional: true})
    @modelsafe.minLength(1)
    public nickname?: string;

    @modelsafe.attr(modelsafe.STRING)
    @modelsafe.minLength(1)
    public email: string;

    @modelsafe.attr(modelsafe.STRING)
    public photoURL: string;

    @modelsafe.assoc(modelsafe.HAS_MANY, () => LibraryAccessModel)
    public access: LibraryAccessModel[];
    
    @modelsafe.attr(modelsafe.STRING, {optional: true})
    public googleId?: string;
}
