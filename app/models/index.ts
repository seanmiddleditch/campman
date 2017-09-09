import * as squell from 'squell';
import {Note} from './note';
import {Label} from './label';
import {Library} from './library';
import UserModel from './UserModel';

export {Note, Label, Library};

export function defineModels(db: squell.Database)
{
    db.define(Library);
    db.define(Label);
    db.define(Note);
    db.define(UserModel);
}