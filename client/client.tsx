import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './components/App';

import ClientGateway, {Library} from './common/ClientGateway';

(() => {
    const gateway = new ClientGateway();
    gateway.retrieveAuth().then(auth => {
        gateway.library('default').then(library => {
            ReactDOM.render(<App gateway={gateway} user={auth.user} library={library}/>, document.getElementById('content'));
        })
    });
})();
