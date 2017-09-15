import {Request, Response} from 'express';
import User from '../auth/User';

export interface ErrorSchema
{
    status: 'error',
    httpStatusCode?: number,
    message: string
};

export interface SuccessSchema<T>
{
    status: 'success',
    data?: T
};

export type ResultSchema<T> = ErrorSchema|SuccessSchema<T>;

export function success<T>(data?: T) : SuccessSchema<T>
{
    return {status: 'success', data};
}

export function notFound(detail?: string) : ErrorSchema
{
    return {status: 'error', httpStatusCode: 404, message: detail || 'Resource not found'};
}

export function accessDenied(detail?: string) : ErrorSchema
{
    return {status: 'error', httpStatusCode: 401, message: detail || 'Access denied'};
}

export function badInput(detail?: string) : ErrorSchema
{
    return {status: 'error', httpStatusCode: 400, message: detail || 'Bad input'};
}

interface KeyValueInput { [key: string]: string };
type Wrapper<T> = (req: {query: KeyValueInput, params: KeyValueInput, body?: any, user?: User, session?: {id: string, destroy: (err: any)=>void}}) => Promise<ResultSchema<T>>;

export function wrap<T>(func: Wrapper<T>)
{
    return async (req: Request, res: Response) => {
        try
        {
            const result = await func(req);
            if (result.status === 'error')
                res.status(result.httpStatusCode || 400).json({status: 'error', message: result.message});
            else
                res.json({status: 'success', data: result.data});
        }
        catch (err)
        {
            console.error(err, err.stack);
            res.status(500).json({status: 'error', message: 'Internal server error'});
        }
    };
}