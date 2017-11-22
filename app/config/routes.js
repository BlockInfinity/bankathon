import React from 'react'
import Main from '../components/layouts/Main';
import Blank from '../components/layouts/Blank';

import AppView from '../views/AppView';

import { Route, Router, IndexRedirect, browserHistory} from 'react-router';

export default (
    <Router history={browserHistory}>
        <Route path="/" component={AppView}> </Route>
    </Router>
);
