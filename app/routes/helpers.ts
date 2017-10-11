import {Request, Response} from 'express'

export function wrapper(func: (req: Request, res: Response) => void)
{
    return async (req: Request, res: Response) => {
        try
        {
            await func(req, res)
        }
        catch (err)
        {
            console.error(err, err.stack)
            res.status(500).json({status: 'error', message: 'Internal server error'})
        }
    }
}