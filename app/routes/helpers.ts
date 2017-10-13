import {Request, Response} from 'express'

export function ok(res: Response, data: any, message?: string, status?: number)
{
    res.status(status || 200)
    res.json({
        status: 'success',
        data,
        message
    })
}

export function fail(res: Response, status: number = 500, message?: string, data?: any)
{
    res.status(status)
    res.json({
        status: 'error',
        data,
        message: message || 'Request failed'
    })
}

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