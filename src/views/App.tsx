import React, { FunctionComponent } from 'react';
import { HashRouter, Route, Link, Switch, Redirect } from 'react-router-dom'
import Video from './video/Video';
import Record from './record/Record';
import Layout from '../components/Layout';

const App: FunctionComponent = () => (
  <Layout>

    <HashRouter>
      <div>
        <header>
          <nav>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/record">Record</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/users">Users</Link>
            </li>
          </nav>
        </header>
        {/* 按从上往下顺序匹配
            exact 表示精确匹配
        */}
        <Switch>
          <Route exact path="/">
            <Video /> 
          </Route>
          <Route path="/record">
            <Record />
          </Route>
          <Route path="/error">
            <div>404 Oops...</div>
          </Route>
          <Route path="*">
            <Redirect to="/error" />
          </Route>
        </Switch>
      </div>
    </HashRouter>
  </Layout>
);

export default App;
