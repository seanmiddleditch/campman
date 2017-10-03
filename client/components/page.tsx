import * as React from 'react';

interface PageHeaderProps
{
    icon?: string
    title: string
}
export function PageHeader(props: PageHeaderProps)
{
    return (
        <div className='page-header'>
            <h1>{props.icon && <i className={'fa fa-' + props.icon}></i>} {props.title}</h1>
        </div>
    )
}

interface PageBodyProps
{
    children: any
}
export function PageBody(props: PageBodyProps)
{
    return (
        <div className='page-content'>
            {props.children}
        </div>
    )
}

interface PageProps
{
    children: any
}
export function Page(props: PageProps)
{
    return (
        <div className='page'>
            {props.children}
        </div>
    )
}