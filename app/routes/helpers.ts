import {Request, Response, NextFunction} from 'express'
import * as squell from 'squell'
import {LibraryModel} from '../models/library-model'
import {User} from '../auth/user'
import {Access} from '../auth/access'

export interface ErrorSchema
{
    status: 'error',
    httpStatusCode?: number,
    message: string
}

export interface SuccessSchema<T>
{
    status: 'success',
    data?: T
}

export type ResultSchema<T> = ErrorSchema|SuccessSchema<T>

export function success<T>(data?: T) : SuccessSchema<T>
{
    return {status: 'success', data}
}

export function notFound(detail?: string) : ErrorSchema
{
    return {status: 'error', httpStatusCode: 404, message: detail || 'Resource not found'}
}

export function accessDenied(detail?: string) : ErrorSchema
{
    return {status: 'error', httpStatusCode: 401, message: detail || 'Access denied'}
}

export function badInput(detail?: string) : ErrorSchema
{
    return {status: 'error', httpStatusCode: 400, message: detail || 'Bad input'}
}

export function authenticated()
{
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user)
            next()
        else
            res.status(401).json({status: 'error', message: 'Authorization required'})
    }
}

export function authorized(db: squell.Database, access: Access = Access.Visitor)
{
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (req.library)
        {
            const librarySlug = req.library.slug
            const userId = req.user ? req.user.id : null
            
            const [library, allowed] = await LibraryModel.queryAccess(db, librarySlug, userId)
            if (allowed >= access)
            {
                req.accessLevel = allowed
                next()
            }
            else if (req.user)
            {
                res.status(403).json({status: 'error', message: 'Access forbidden'})
            }
            else
            {
                res.status(401).json({status: 'error', message: 'Authorization required'})
            }
        }
        else
        {
            res.status(400).json({status: 'error', message: 'Invalid API endpoint'})
        }
    }
}

type Wrapper<T> = (req: {query: {[key: string]: string|string[]}, params: {[key: string]: string}, body?: any, library?: {slug: string}, user?: User, session?: {id: string, destroy: (err: any)=>void}}) => Promise<ResultSchema<T>>
export function wrap<T>(func: Wrapper<T>)
{
    return async (req: Request, res: Response) => {
        try
        {
            const result = await func(req)
            if (result.status === 'error')
                res.status(result.httpStatusCode || 400).json({status: 'error', message: result.message})
            else
                res.json({status: 'success', data: result.data})
        }
        catch (err)
        {
            console.error(err, err.stack)
            res.status(500).json({status: 'error', message: 'Internal server error'})
        }
    }
}