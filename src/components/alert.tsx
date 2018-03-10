import * as React from 'react'

export const Alert = ({type, children}: {type?: 'primary'|'danger', children?: React.ReactNode}) => (type && children) ? <div className={`alert alert-${type}`} role='alert'>{children}</div> : <div/>