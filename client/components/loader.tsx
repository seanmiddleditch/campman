import * as React from 'react';

export interface LoaderProps
{
    load: () => any;
};
interface LoaderState
{

};
export default class Loader extends React.Component<LoaderProps, LoaderState>
{
    constructor(props: LoaderProps)
    {
        super(props);
        this.state = {};
    }
}