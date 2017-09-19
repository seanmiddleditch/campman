import * as React from 'react';

export default function NotFoundPage()
{
    return <div>
        <div className="page-header">
            <h1><i className="fa fa-exclamation-triangle"></i> Page Not Found</h1>
        </div>
        <div className="content">
            The requested content cannot be found.
        </div>
    </div>;
}