import NoteAPIRouter from './NoteAPIRouter';
import LabelAPIRouter from './LabelAPIRouter';
import AuthRouter from './AuthRouter';
import { Database } from 'squell';
import { Router } from 'express';

export function routes(db: Database)
{
    const router = Router();
    router.use(AuthRouter());
    router.use(NoteAPIRouter(db));
    router.use(LabelAPIRouter(db));
    return router;
}