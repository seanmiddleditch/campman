import * as React from 'react'

const style: React.CSSProperties = {
    background: 'linear-gradient(to right, lightgrey, transparent 70%, transparent 100%)',
    padding: 4,
    paddingLeft: '1em',
    borderRadius: 4,
    margin: 6
}

export const SecretBlock: React.SFC<{}> = ({children}) =>
    <div style={style}>
        <h6 className='mb-2'><i className='fa fa-eye-slash mr-2'></i> GM Secret</h6>
        {children}
    </div>