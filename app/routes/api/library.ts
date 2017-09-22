import {Request, Response, Router} from 'express';
import {LibraryModel, LibraryAccessModel, UserModel} from '../../models';
import * as squell from 'squell';
import Access from '../../auth/access';
import {wrap, success, accessDenied, notFound} from '../helpers';

export default function LabelAPIRoutes(db: squell.Database)
{
    const router = Router();

    router.get('/api/libraries', wrap(async (req) => {
        const userID = req.user ? req.user.id : null;

        const all = await db.query(LibraryModel)
            .attributes(m => [m.slug])
            .include(LibraryAccessModel, m => [m.acl, {required: false}], q => q.attributes(m => []).where(m => squell.attribute('userId').eq(userID)))
            .order(m => [[m.slug, squell.ASC]])
            .find();

        return success(all);
    }));

    router.get('/api/libraries/:library', wrap(async (req) => {
        const userID = req.user ? req.user.id : null;

        const librarySlug = req.params.library;
        const library = await db.query(LibraryModel)
            .attributes(m => [m.slug])
            //.include(LibraryAccessModel, m => m.acl, q => q.attributes(m => []).include(UserModel, m => m.user, q => q.where(m => m.id.eq(userID))))
            .where(m => m.slug.eq(librarySlug))
            .findOne();

        if (!library) return notFound();
        else return success(library);
    }));

    return router;
}