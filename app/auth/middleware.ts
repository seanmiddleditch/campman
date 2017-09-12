import * as express from 'express';
import * as passport from 'passport';
import User from './User';

export function requireAuth(check?: (user: User) => Promise<void>) : express.Handler
{
    return (req: express.Request, res: express.Response, next: express.NextFunction) =>
    {
        if (!req.user)
            return res.sendStatus(401);

        console.log('Logged in as ' + req.user.fullName);

        if (check && !check(req.user as User))
            return res.sendStatus(401);

        next();
    };
}